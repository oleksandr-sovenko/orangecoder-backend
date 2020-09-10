import dashboardPage   from '../pages/dashboard.f7.html';
import programmingPage from '../pages/programming.f7.html';
import settingsPage    from '../pages/settings.f7.html';
import storagePage     from '../pages/storage.f7.html';


var routes = [{
        name: 'dashboard',
        path: '/dashboard',
        component: dashboardPage,
    }, {
        name: 'storage',
        path: '/storage',
        async: function(routeTo, routeFrom, resolve, reject) {
            var self = this,
                app  = self.app;

            //app.dialog.preloader(app.methods.i18n('Loading ...'));
            app.methods.getFiles('/', function(response, status, xhr) {
                resolve({ component: storagePage }, { context: { storage: { path: [], files: response } }});
                //app.dialog.close();
            });
        }
    }, {
        name: 'programming',
        path: '/programming',
        async: function(routeTo, routeFrom, resolve, reject) {
            var self = this,
                app  = self.app;

            //app.dialog.preloader(app.methods.i18n('Loading ...'));
            app.methods.getAlgorithms(function(response, status, xhr) {
                resolve({ component: programmingPage }, { context: { programming: { algorithms: response } }});
                //app.dialog.close();
            });
        }
    }, {
        name: 'settings',
        path: '/settings',
        component: settingsPage,
    },
];

export default routes;