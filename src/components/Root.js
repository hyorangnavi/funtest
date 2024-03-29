import React, {useState, useEffect} from 'react';
import {Client as Styletron} from 'styletron-engine-atomic';
import {Provider as StyletronProvider} from 'styletron-react';
import { BaseProvider } from 'baseui';
import {createTheme, lightThemePrimitives} from 'baseui';
import {requestBase} from '../utils'
import Login from './Login';
import {
  ToasterContainer,
  PLACEMENT
} from "baseui/toast";
import { 
  Route, 
  Switch,
  Redirect, 
  BrowserRouter as Router } from 'react-router-dom'
  import { StyledSpinnerNext } from "baseui/spinner"
import Header from './Header';
import CreateNewEvent from './CreateNewEvent';
import EventList from './EventList';
import Manage from './Manage';

const primitives = {
  ...lightThemePrimitives,
  font: {
    ui: "'quicksand', sans-serif"
  },
  primaryFontFamily: 'quicksand',
  primary: '#4F4457',
  primary100: "#847c89",
  primary200: "#726979",
  primary300: "#615768",
  primary400: "#4f4457",
  primary500: "#473d4e",
  primary600: "#3f3646",
  primary700: "#37303d",
  accent: '#F4E164',
  darkAccent: "#2B213C",
  lightGray: "#eaeaea",
  danger: "#b71c1c",
  dangerDark: "#7f0000"
}

const overrides = {
  colors: {
    buttonPrimaryFill: primitives.primary,
    buttonPrimaryHover: primitives.darkAccent,
    buttonSecondaryFill: primitives.primary100,
    buttonSecondaryText: "white",
    buttonTertiaryFill: primitives.accent,
    buttonTertiaryHover: primitives.darkAccent,
    buttonTertiaryText: primitives.darkAccent,
    buttonTertiaryHoverText: primitives.accent,

    buttonPrimarySelectedFill: primitives.accent,
    buttonPrimarySelectedText: primitives.darkAccent,
  }
}

const theme = createTheme(primitives, overrides);

const engine = new Styletron({
  prefix: "bui_"
});

function PrivateRoute({ children, ...rest }) {
  const [loggedIn, setLoggedIn] = useState(null);

  const checkLoginStatus = async () => {
    const authReq = await requestBase.post("/user/isAuthenticated");

    if (authReq.data.success === false) {
      setLoggedIn(false);
      return;
    }

    setLoggedIn(true);
  }

  useEffect(() => {
    checkLoginStatus();
  }, [])

  return (
    <Route
      {...rest}
      render={({ location }) =>
        loggedIn === null ? (<StyledSpinnerNext></StyledSpinnerNext>)
        : loggedIn === true ? (
          children
        ) : (
          <Redirect
            to={{
              pathname: "/login",
              state: { from: location }
            }}
          />
        )
      }
    />
  );
}

export default function Root() {
  return (
    <StyletronProvider value={engine}>
      <BaseProvider theme={theme}>
        <ToasterContainer
          overrides={{
            ToastBody: {
              style: () => ({
                borderBottomLeftRadius: "5px",
                borderBottomRightRadius: "5px",
                borderTopLeftRadius: "5px",
                borderTopRightRadius: "5px"
              })
            }
          }}
          usePortal={true} 
          placement={PLACEMENT.bottomRight} 
          autoHideDuration={5000}>
            <Router basename="/event/manageEvent">
              <Header></Header>
              <Switch>
                <Route exact path="/login">
                  <Login></Login>
                </Route>
                <PrivateRoute exact path="/newEvent">
                  <CreateNewEvent></CreateNewEvent>
                </PrivateRoute>
                <PrivateRoute path="/event/:eventId">
                  <Manage eventType="regular"></Manage>
                </PrivateRoute>
                <PrivateRoute path="/groupEvent/:eventId">
                  <Manage eventType="group"></Manage>
                </PrivateRoute>
                <PrivateRoute exact path="/">
                  <EventList></EventList>
                </PrivateRoute>
              </Switch>
            </Router>
        </ToasterContainer>
      </BaseProvider>
    </StyletronProvider>
  );
}
