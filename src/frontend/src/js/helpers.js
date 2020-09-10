import moment    from 'moment';
import Template7 from 'template7';


/** Test helper
 *
 */
Template7.registerHelper('_t', function(v) {
    var t7 = Template7.global,
        result = '';

    try {
        result = t7.i18n[t7.locale][v];
    } catch(e) {
        result = v;
    }

    return result !== undefined ? result : v;
});


/** Test helper
 *
 */
Template7.registerHelper('echoDateTime', function(v, f) {
    return moment(v).format(f);
});


/** Test helper
 *
 */
Template7.registerHelper('e_price', function(v, c) {
    if (c == 'rub')
        return v + ' ₽';

    if (c == 'uah')
        return v + ' ₴';

    if (c == 'usd')
        return '$' + v;

    if (c == 'eur')
        return 'ййй €' + v;

    return '';
});


/** Print Pins
 *
 */
Template7.registerHelper('e_pins', function(pins) {

    console.log(Template7.global);

    // for (var index in pins) {
    //     for (var index in window.app.data.gpio.readall) {
    //     }
    // }
    // console.log(window.app.data.gpio.readall);
    return JSON.stringify(pins).toUpperCase().replace(/\{/g, '').replace(/\}/g, '').replace(/"/g, '');
});
