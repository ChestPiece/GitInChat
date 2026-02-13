
import { createRepositoryTool } from '../lib/ai/tools/repository/create-repository';
import { updateRepositoryTool } from '../lib/ai/tools/repository/update-repository';
import { deleteRepositoryTool } from '../lib/ai/tools/repository/delete-repository';
import { z } from 'zod';

// Mock getGitHubClient to avoid actual API calls during this specific test if we wanted unit tests,
// but for this verification we WANT actual API calls to see if the custom logic works with real GitHub behavior.
// However, running this in a CI/CD or automated way might be flaky. 
// For this session, I will run it manually. 

// BUT, I can't interactively input confirmation.
// I will structure the test to be self-contained.

async function runVerification() {
  const timestamp = Date.now();
  const repoName = `test-repo-${timestamp}`; // "Test Repo 123" -> "test-repo-123"
  // Intentionally use a name that needs sanitization
  const repoNameInput = `Test Repo ${timestamp}`; 
  const owner = process.env.GITHUB_OWNER || "moeez"; // Fallback, better to fetch from whoami if possible, but let's assume we know or get it from first create result
  
  console.log(`--- Starting Verification for ${repoNameInput} ---`);

  try {
    // 1. Create Repository
    console.log(`\n1. Creating repository: "${repoNameInput}"`);
    const createResult = await createRepositoryTool.execute({
      name: repoNameInput,
      description: "Temporary verification repository",
      private: true,
      auto_init: true
    });
    
    console.log("Create Result:", JSON.stringify(createResult, null, 2));

    if (!createResult.success) {
      console.error("Failed to create repository. Aborting.");
      return;
    }

    const actualOwner = createResult.data?.owner || createResult.data?.full_name?.split('/')[0] || owner;
    const actualName = createResult.data?.name; // Should be sanitized

    if (createResult.data?.warning) {
        console.log("✅ SUCCESS: Creation warning present:", createResult.data.warning);
    } else {
        console.log("⚠️ WARNING: No sanitization warning on creation (maybe name didn't need it?)");
    }

    // 2. Update Repository
    const newNameInput = `Updated Test Repo ${timestamp}`;
    console.log(`\n2. Updating repository name to: "${newNameInput}"`);
    
    // allow some time for propagation? usually instant.
    
    const updateResult = await updateRepositoryTool.execute({
      owner: actualOwner,
      repo: actualName,
      name: newNameInput,
      description: "Updated description"
    });

    console.log("Update Result:", JSON.stringify(updateResult, null, 2));
    
    if (updateResult.data?.warning) {
        console.log("✅ SUCCESS: Update warning present:", updateResult.data.warning);
    } else {
       console.log("⚠️ WARNING: No sanitization warning on update");
    }

    const updatedName = updateResult.data?.name || actualName; // In case update failed or didn't return name

    // 3. Delete Repository (Fail Case)
    console.log(`\n3. Attempting deletion with WRONG confirmation`);
    const deleteFailResult = await deleteRepositoryTool.execute({
      owner: actualOwner,
      repo: updatedName,
      confirm_name: "wrong-name"
    });
    
    console.log("Delete (Expected Fail) Result:", JSON.stringify(deleteFailResult, null, 2));
    
    if (!deleteFailResult.success && deleteFailResult.error) {
        console.log("✅ SUCCESS: Deletion blocked as expected.");
    } else {
        console.error("❌ FAILURE: Deletion should have been blocked!");
    }

    // 4. Delete Repository (Success Case)
    console.log(`\n4. Attempting deletion with CORRECT confirmation`);
    const deleteSuccessResult = await deleteRepositoryTool.execute({
      owner: actualOwner,
      repo: updatedName,
      confirm_name: updatedName
    });

    console.log("Delete (Success) Result:", JSON.stringify(deleteSuccessResult, null, 2));

    if (deleteSuccessResult.success) {
        console.log("✅ SUCCESS: Repository deleted.");
    } else {
        console.error("❌ FAILURE: Failed to delete repository.");
    }

  } catch (error) {
    console.error("Verification script crashed:", error);
  }
}

runVerification();
