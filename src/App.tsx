import Home from "./Home";
import { Theme } from "@radix-ui/themes";

import "@radix-ui/themes/styles.css";

const App = () => {
  return (
    <Theme>
      <Home />
    </Theme>
  )
}

export default App
