function App() {
  // Connection testing, should be removed later

  async function test() {
    const res = await fetch("api/test/hello-world");
    console.log(res);
  }

  test();

  return (
    <>
      <section id="center">
        <h1 className={"text-red-500 text-xl p-10"}>Test</h1>
      </section>
    </>
  );
}

export default App;
