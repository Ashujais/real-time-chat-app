'use strict';

const http = require('http');
const { io: ioClient } = require('socket.io-client');
const app = require('./app');
const config = require('./src/config');
const initializeSockets = require('./src/sockets/socketHandler');
const { Server } = require('socket.io');

const TEST_PORT = 5001;
const SERVER_URL = `http://localhost:${TEST_PORT}`;

async function runTests() {
  console.log('====================================================');
  console.log('STARTING COMPLETE AUTOMATED END-TO-END VERIFICATION');
  console.log('====================================================\n');

  // Start dedicated test server
  const server = http.createServer(app);
  const io = new Server(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] }
  });
  app.set('io', io);
  initializeSockets(io);

  await new Promise((resolve) => server.listen(TEST_PORT, resolve));
  console.log(`[PASS] TEST 1: Backend server started on port ${TEST_PORT}`);

  const results = [];
  const record = (num, name, passed, detail) => {
    results.push({ num, name, passed, detail });
    console.log(`[${passed ? 'PASS' : 'FAIL'}] TEST ${num}: ${name} - ${detail}`);
  };

  try {
    // Helper for REST requests
    const postMessage = async (body) => {
      const res = await fetch(`${SERVER_URL}/api/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      return { status: res.status, data };
    };

    const getMessages = async () => {
      const res = await fetch(`${SERVER_URL}/api/messages`);
      const data = await res.json();
      return { status: res.status, data };
    };

    // TEST 10: Validation on empty message
    const emptyMsgRes = await postMessage({ username: 'Ashutosh', message: '' });
    record(10, 'Empty Message Validation', emptyMsgRes.status === 400 && !emptyMsgRes.data.success, `Status ${emptyMsgRes.status}, error: "${emptyMsgRes.data.error}"`);

    // TEST 11: Validation on invalid username
    const invalidUserRes = await postMessage({ username: '', message: 'Valid message' });
    record(11, 'Invalid Username Validation', invalidUserRes.status === 400 && !invalidUserRes.data.success, `Status ${invalidUserRes.status}, error: "${invalidUserRes.data.error}"`);

    // TEST 3: Open two clients/users via Socket.io
    const clientA = ioClient(SERVER_URL, { reconnection: true, autoConnect: true });
    const clientB = ioClient(SERVER_URL, { reconnection: true, autoConnect: true });

    await Promise.all([
      new Promise((resolve) => clientA.on('connect', resolve)),
      new Promise((resolve) => clientB.on('connect', resolve))
    ]);

    let onlineListFromA = [];
    let onlineListFromB = [];

    clientA.on('user:online', (data) => { onlineListFromA = data.onlineUsers; });
    clientB.on('user:online', (data) => { onlineListFromB = data.onlineUsers; });

    clientA.emit('user:join', { username: 'Ashutosh' });
    clientB.emit('user:join', { username: 'Priya' });

    // Wait for join broadcast
    await new Promise((r) => setTimeout(r, 200));

    record(3, 'Two Clients Connected & Joined', onlineListFromA.includes('Ashutosh') && onlineListFromA.includes('Priya'), `Online users: ${JSON.stringify(onlineListFromA)}`);

    // TEST 4: User A sends a message. Verify User B receives it instantly without refresh.
    const userBMessages = [];
    clientB.on('message:new', (msg) => {
      userBMessages.push(msg);
    });

    const sendResA = await postMessage({ username: 'Ashutosh', message: 'Hello Priya, welcome!' });
    record(14, 'REST API POST Response', sendResA.status === 201 && sendResA.data.success, `Created message ID ${sendResA.data.data.id}`);

    // Wait for realtime delivery to B
    await new Promise((r) => setTimeout(r, 200));

    const receivedByB = userBMessages.find((m) => m.id === sendResA.data.data.id);
    record(4, 'User A sends message, User B receives instantly', Boolean(receivedByB), `User B received: "${receivedByB ? receivedByB.message : 'NONE'}"`);

    // TEST 5: User B responds. Verify User A receives it instantly.
    const userAMessages = [];
    clientA.on('message:new', (msg) => {
      userAMessages.push(msg);
    });

    const sendResB = await postMessage({ username: 'Priya', message: 'Hi Ashutosh! Glad to be here.' });
    await new Promise((r) => setTimeout(r, 200));

    const receivedByA = userAMessages.find((m) => m.id === sendResB.data.data.id);
    record(5, 'User B responds, User A receives instantly', Boolean(receivedByA), `User A received: "${receivedByA ? receivedByA.message : 'NONE'}"`);

    // TEST 7: Verify timestamps appear.
    const hasTimestamps = receivedByB && receivedByB.createdAt && !isNaN(Date.parse(receivedByB.createdAt));
    record(7, 'Message Timestamps', Boolean(hasTimestamps), `Timestamp: ${receivedByB ? receivedByB.createdAt : 'MISSING'}`);

    // TEST 12: Verify messages are not duplicated.
    const bMessageCountForFirstMsg = userBMessages.filter((m) => m.id === sendResA.data.data.id).length;
    record(12, 'No Duplicate Messages', bMessageCountForFirstMsg === 1, `Message received ${bMessageCountForFirstMsg} time(s) on Client B`);

    // BONUS TEST: Typing Indicator
    let typingDetected = false;
    clientB.on('user:typing', (data) => {
      if (data.username === 'Ashutosh') typingDetected = true;
    });
    clientA.emit('user:typing', { username: 'Ashutosh' });
    await new Promise((r) => setTimeout(r, 150));
    record(15, 'Typing Indicator Socket Event', typingDetected, 'Client B received typing event from Ashutosh');

    // TEST 6 & 13: Refresh/reopen simulation & Database persistence
    const historyRes = await getMessages();
    const persisted = historyRes.data.data.some((m) => m.id === sendResA.data.data.id) &&
                      historyRes.data.data.some((m) => m.id === sendResB.data.data.id);
    record(6, 'Retrieve Chat History on Reopen', historyRes.status === 200 && historyRes.data.data.length >= 2, `History count: ${historyRes.data.total}`);
    record(13, 'Database Persistence in SQLite', persisted, 'Messages persisted and retrievable via GET /api/messages');

    // TEST 8: Disconnect one client. Verify handled gracefully.
    let offlineDetected = false;
    clientA.on('user:offline', (data) => {
      if (data.username === 'Priya') offlineDetected = true;
    });

    clientB.disconnect();
    await new Promise((r) => setTimeout(r, 200));
    record(8, 'Handle Disconnection Gracefully', offlineDetected, 'Client A received user:offline for Priya');

    // TEST 9: Reconnect. Verify recovery.
    const clientBReconnected = ioClient(SERVER_URL, { reconnection: true, autoConnect: true });
    await new Promise((resolve) => clientBReconnected.on('connect', resolve));
    clientBReconnected.emit('user:join', { username: 'Priya' });
    await new Promise((r) => setTimeout(r, 200));
    record(9, 'Client Reconnection Recovery', clientBReconnected.connected, 'Client B reconnected and rejoined successfully');

    clientA.disconnect();
    clientBReconnected.disconnect();

  } finally {
    await new Promise((resolve) => server.close(resolve));
    console.log('\nTest server shut down cleanly.');
  }

  const allPassed = results.every((r) => r.passed);
  console.log('\n====================================================');
  console.log(`SUMMARY: ${results.filter((r) => r.passed).length} / ${results.length} TESTS PASSED`);
  console.log(`OVERALL STATUS: ${allPassed ? 'SUCCESS' : 'FAILURE'}`);
  console.log('====================================================');
  process.exit(allPassed ? 0 : 1);
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
