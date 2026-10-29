import test from 'node:test';
import assert from 'node:assert/strict';
import { verifyMemberPasscode, normalizePasscode } from './auth';

test('normalizePasscode removes spaces around slashes and trims', () => {
  assert.equal(normalizePasscode(' 3 / ตุลาคม / 2551 '), '3/ตุลาคม/2551');
  assert.equal(normalizePasscode('2/ เมษายน /2552'), '2/เมษายน/2552');
});

test('verifyMemberPasscode verifies each member correctly with exact and spaced input', () => {
  // ซีซ่า: 3/ตุลาคม/2551
  assert.equal(verifyMemberPasscode('ซีซ่า', '3/ตุลาคม/2551'), true);
  assert.equal(verifyMemberPasscode('ซีซ่า', ' 3 / ตุลาคม / 2551 '), true);
  assert.equal(verifyMemberPasscode('ซีซ่า', 'wrong-pass'), false);

  // ว่าน: 2/เมษายน/2552
  assert.equal(verifyMemberPasscode('ว่าน', '2/เมษายน/2552'), true);

  // ขนมต้ม: 29/มีนาคม/2552
  assert.equal(verifyMemberPasscode('ขนมต้ม', '29/มีนาคม/2552'), true);

  // สตางค์: 17/กุมภาพันธ์/2552
  assert.equal(verifyMemberPasscode('สตางค์', '17/กุมภาพันธ์/2552'), true);

  // ต้นกล้า: 6/มีนาคม/2552
  assert.equal(verifyMemberPasscode('ต้นกล้า', '6/มีนาคม/2552'), true);
});

test('verifyMemberPasscode rejects "อื่นๆ" and unknown members', () => {
  assert.equal(verifyMemberPasscode('อื่นๆ', '1234'), false);
  assert.equal(verifyMemberPasscode('คนอื่น', '1234'), false);
});
