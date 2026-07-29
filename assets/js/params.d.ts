// Hugo's js.Build exposes its `params` option as a virtual "@params" module that
// esbuild resolves at build time. TypeScript cannot see that module, so its shape
// is declared here to keep `task typecheck` honest.
declare module "@params" {
  const params: {
    projectId: string
  }
  export default params
}
