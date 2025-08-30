import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// PrimeReact imports
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

import FRANCAIS from './lang/fr.json'
import ENGLISH from './lang/en.json'
import { IntlProvider } from 'react-intl'
import { Provider, useSelector } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import stores from './stores/index.js';
import { localeSelector } from './stores/selectors/appSelectors.js';

const IntlApp = () => {
    const locale = useSelector(localeSelector)
    var messages
    switch (locale) {
              case 'en':
                        messages = ENGLISH
                        break
              default:
                        messages = FRANCAIS
    }
    return (
              <IntlProvider messages={messages} locale={locale} defaultLocale="fr">
                        <App />
              </IntlProvider>
    )
} 

ReactDOM.createRoot(document.getElementById('root')).render(
  // <React.StrictMode>
    <Provider store={stores}>
        <IntlApp/>
    </Provider>,
  // </React.StrictMode>,
)