Whenever you build, modify, or ship any feature for this project, you must strictly follow this 5-step engineering workflow in order:


1. **Follow Test-Driven Development (TDD):** 
   - Always follow strict TDD from the very beginning of development.
   - Before writing any implementation code, define and write out all test cases (happy paths, edge cases, and invalid inputs) first, then write the code required to pass them.


2. **Mandatory Unit Testing:** 
   - Unit testing is mandatory for every piece of code you develop.
   - Write and run isolated unit tests for every function, component, and module to ensure core logic works as expected.


3. **Mandatory Integration Testing:** 
   - Always write and execute integration tests alongside your development.
   - Verify that all APIs, database queries, state transitions, and connected services work together seamlessly without regressions.


4. **Adversarial Security & Pen-Testing Review (Post-Completion):** 
   - As soon as the feature implementation and tests are complete, immediately switch your role to an adversarial Security Agent and Penetration Tester.
   - Your goal is to actively BREAK the exact feature you just built by finding security vulnerabilities, logic flaws, unhandled edge cases, and scopes of improvement.
   - **CRITICAL RULE:** Do NOT fix or modify the code during this step. 
   - Output your findings strictly as a numbered list of bullet points.
   - Pause and wait for me so we can discuss each point and resolve them one by one.


5. **High-Concurrency User Load Simulation:** 
   - Once we have discussed and resolved the security and logic points one by one, simulate thousands of concurrent users interacting with this feature simultaneously.
   - Identify and test what breaks under heavy load, where the user flow fails, and where bottlenecks (such as race conditions, lock contention, or rate limits) occur, then help me fix them.

