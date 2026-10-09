import { useState } from "react";
import { FileUpload } from "./components/file-upload";
import { Button } from "./components/ui/button";
import { ConfirmDialog } from "./components/confirm-dialog";

function App() {
  async function test() {
    const res = await fetch("api/test/hello-world");
    console.log(res);
  }

  test();

  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <>
      <section id="center">
        <h1 className="text-xl">Test</h1>
        <h2 className="text-success">Success</h2>
        <h2 className="text-warning">Warning</h2>
        <h2 className="text-danger">Danger</h2>
        <Button>Login</Button>
        <Button variant="destructive" onClick={() => setConfirmOpen(true)}>
          Wypisz dziecko
        </Button>
        <ConfirmDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          title="Wypisać dziecko z klasy?"
          description="Dziecko straci przypisane zbiórki. Tej akcji nie można cofnąć."
          confirmLabel="Wypisz"
          onConfirm={() => setConfirmOpen(false)}
        />
        <FileUpload />
      </section>
    </>
  );
}

export default App;
