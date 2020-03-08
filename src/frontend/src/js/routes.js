import HomePage from '../pages/home.f7.html';
import GPIOPage from '../pages/gpio.f7.html';
import ProgrammingPage from '../pages/programming.f7.html';
import SystemPage from '../pages/system.f7.html';
import StoragePage from '../pages/storage.f7.html';

var routes = [{
        path: '/',
        component: HomePage,
    }, {
        path: '/storage/',
        component: StoragePage,
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