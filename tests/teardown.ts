import { execSync } from "child_process"

export default async function teardown() {
  execSync("task stop")
}
