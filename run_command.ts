import { execSync } from "child_process";

function run(cmd: string) {
  try {
    console.log(`=== RUNNING: ${cmd} ===`);
    const output = execSync(cmd, { encoding: "utf-8" });
    console.log(output);
  } catch (error: any) {
    console.error(`ERROR:`, error.message);
    if (error.stdout) console.log("STDOUT:", error.stdout);
    if (error.stderr) console.log("STDERR:", error.stderr);
  }
}

run("pg_isready -h localhost");
run("ps -ef");
run("which pg_ctl postgres pg_isready systemctl service");
