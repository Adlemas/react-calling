import { BrowserRouter, Route, Switch } from "react-router-dom";
import Main from "./pages/Main";
import Room from "./pages/Room";
import NotFound404 from "./pages/NotFound";

function App() {
  return (
    <BrowserRouter>
      <Switch>
        <Route exact path="/room/:id" component={Room} />
        <Route exact path="/" component={Main} />
        <Route component={NotFound404} />
      </Switch>
    </BrowserRouter>
  );
}

export default App;
