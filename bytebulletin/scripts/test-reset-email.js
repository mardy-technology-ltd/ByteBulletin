import { sendPasswordResetLinkAction } from "../actions/auth.actions";
import "dotenv/config";

async function testReset() {
  console.log("Testing sendPasswordResetLinkAction for johnlitonmardy88@gmail.com...");
  const res1 = await sendPasswordResetLinkAction("johnlitonmardy88@gmail.com");
  console.log("Result 1 (johnlitonmardy88@gmail.com):", res1);

  console.log("\nTesting sendPasswordResetLinkAction for admin@bytebulletin.com...");
  const res2 = await sendPasswordResetLinkAction("admin@bytebulletin.com");
  console.log("Result 2 (admin@bytebulletin.com):", res2);
}

testReset();
