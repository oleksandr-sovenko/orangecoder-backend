import DashboardPage from '../pages/dashboard.f7.html';
import ProgrammingPage from '../pages/programming.f7.html';
import SettingsPage from '../pages/settings.f7.html';
import StoragePage from '../pages/storage.f7.html';

var routes = [{
        path: '/',
        component: DashboardPage,
    }, {
        path: '/storage/',
        component: StoragePage,
    }, {
        path: '/programming/',
        component: ProgrammingPage,
    }, {
        path: '/settings/',
        component: SettingsPage,
    },
];

export default routes;