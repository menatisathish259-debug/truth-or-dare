/**
 * Verification Test Suite for Smart Random Question System
 * Strictly tests the per-player, per-session no-repeat guarantees.
 */

// Simulated Question Library
const mockQuestions = [
  { id: 'q1', type: 'truth', category: 'funny', difficulty: 'easy', text: 'Truth 1', isActive: true },
  { id: 'q2', type: 'truth', category: 'funny', difficulty: 'easy', text: 'Truth 2', isActive: true },
  { id: 'q3', type: 'truth', category: 'funny', difficulty: 'easy', text: 'Truth 3', isActive: true },
  { id: 'd1', type: 'dare', category: 'funny_actions', difficulty: 'easy', text: 'Dare 1', isActive: true },
  { id: 'd2', type: 'dare', category: 'funny_actions', difficulty: 'easy', text: 'Dare 2', isActive: true },
];

class MockQuestionEngine {
  constructor(questions) {
    this.questions = questions;
    // session_id -> Map<player_id, Set<question_id>>
    this.history = new Map();
  }

  resetSession(sessionId) {
    this.history.delete(sessionId);
  }

  getNextSmartQuestion(sessionId, playerId, type, categories, difficulties) {
    if (!this.history.has(sessionId)) {
      this.history.set(sessionId, new Map());
    }
    const sessionHistory = this.history.get(sessionId);
    if (!sessionHistory.has(playerId)) {
      sessionHistory.set(playerId, new Set());
    }
    const playerAskedSet = sessionHistory.get(playerId);

    // 1. Filter out already asked questions for THIS player in THIS session
    const eligible = this.questions.filter((q) => {
      if (!q.isActive) return false;
      if (q.type !== type) return false;
      if (categories && categories.length > 0 && !categories.includes(q.category)) return false;
      if (difficulties && difficulties.length > 0 && !difficulties.includes(q.difficulty)) return false;
      if (playerAskedSet.has(q.id)) return false; // STRICT NO-REPEAT
      return true;
    });

    if (eligible.length === 0) {
      return null; // Pool exhausted for this player!
    }

    // Pick random
    const randomIndex = Math.floor(Math.random() * eligible.length);
    const chosen = eligible[randomIndex];

    // Atomically record assignment
    playerAskedSet.add(chosen.id);

    return chosen;
  }
}

function runTests() {
  console.log('=================================================================');
  console.log('RUNNING TEST SUITE: SMART RANDOM QUESTION ENGINE (NO-REPEAT RULE)');
  console.log('=================================================================\n');

  const engine = new MockQuestionEngine(mockQuestions);
  const sessionId = 'session_alpha';
  const playerA = 'player_alice';
  const playerB = 'player_bob';

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition, message) {
    totalTests++;
    if (condition) {
      console.log(`[PASS] ${message}`);
      passedTests++;
    } else {
      console.error(`[FAIL] ${message}`);
      process.exitCode = 1;
    }
  }

  // TEST 1: Alice gets 3 distinct truths without any repeats
  const aliceQ1 = engine.getNextSmartQuestion(sessionId, playerA, 'truth');
  const aliceQ2 = engine.getNextSmartQuestion(sessionId, playerA, 'truth');
  const aliceQ3 = engine.getNextSmartQuestion(sessionId, playerA, 'truth');

  assert(aliceQ1 !== null, 'Alice receives first question');
  assert(aliceQ2 !== null && aliceQ2.id !== aliceQ1.id, 'Alice receives second unique question');
  assert(aliceQ3 !== null && aliceQ3.id !== aliceQ1.id && aliceQ3.id !== aliceQ2.id, 'Alice receives third unique question');

  // TEST 2: Alice has exhausted the truth pool (only 3 exist in mock)
  const aliceQ4 = engine.getNextSmartQuestion(sessionId, playerA, 'truth');
  assert(aliceQ4 === null, 'Alice truth pool exhausted after 3 questions (No silent repetition!)');

  // TEST 3: Bob can still receive the same questions Alice already had
  const bobQ1 = engine.getNextSmartQuestion(sessionId, playerB, 'truth');
  assert(bobQ1 !== null, 'Bob can receive questions that Alice previously answered in the same session');

  // TEST 4: Truth exhaustion does not affect Dares for Alice
  const aliceDare1 = engine.getNextSmartQuestion(sessionId, playerA, 'dare');
  assert(aliceDare1 !== null && aliceDare1.type === 'dare', 'Alice can still receive Dare questions independently');

  // TEST 5: Session reset restores question availability for Alice
  engine.resetSession(sessionId);
  const aliceAfterReset = engine.getNextSmartQuestion(sessionId, playerA, 'truth');
  assert(aliceAfterReset !== null, 'Questions become available again after session reset');

  console.log(`\nResults: ${passedTests} of ${totalTests} tests passed successfully!`);
}

runTests();
