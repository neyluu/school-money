import { Button } from "./components/ui/button";

function App() {
  async function test() {
    const res = await fetch("api/test/hello-world");
    console.log(res);
  }

  test();

  return (
    <>
      <section id="center">
        <h1 className="text-xl">Test</h1>
        <h2 className="text-success">Success</h2>
        <h2 className="text-warning">Warning</h2>
        <h2 className="text-danger">Danger</h2>
        <Button>Login</Button>
      </section>
    </>
  );
}

export default App;
