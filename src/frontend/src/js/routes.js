
//import FormPage from '../pages/form.f7.html';

//import LeftPage1 from '../pages/left-page-1.f7.html';
//import LeftPage2 from '../pages/left-page-2.f7.html';
//import DynamicRoutePage from '../pages/dynamic-route.f7.html';
//import RequestAndLoad from '../pages/request-and-load.f7.html';
//import NotFoundPage from '../pages/404.f7.html';

// import NotFoundPage from '../pages/404.f7.html';

import HomePage from '../pages/home.f7.html';
import GPIOPage from '../pages/gpio.f7.html';
import ProgrammingPage from '../pages/programming.f7.html';
import SystemPage from '../pages/system.f7.html';
import FileSystemPage from '../pages/filesystem.f7.html';

var routes = [{
        path: '/',
        component: HomePage,
    }, {
        path: '/filesystem/',
        component: FileSystemPage,
    }, {
        path: '/gpio/',
        component: GPIOPage,
    }, {
        path: '/programming/',
        component: ProgrammingPage,
    }, {
        path: '/system/',
        component: SystemPage,
    },
];

export default routes;