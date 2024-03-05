const canvas = document.createElement("canvas");
const context = canvas.getContext("2d");

var addEvent = function (el, type, fn) {
    if (el.addEventListener) el.addEventListener(type, fn, false);
    else el.attachEvent("on" + type, fn);
};

var extend = function (obj, ext) {
    for (var key in ext) if (ext.hasOwnProperty(key)) obj[key] = ext[key];
    return obj;
};

const fitText = function (el, xKompressor, yKompressor, options) {
    var settings = extend(
        {
            minFontSize: -1 / 0,
            maxFontSize: 1 / 0,
            font: "monospace",
            property: "innerText"
        },
        options
    );

    var fit = function (el) {
        var xCompressor = xKompressor || 1;
        var yCompressor = yKompressor || xCompressor;

        var resizer = function () {
            const bounds = el.getBoundingClientRect();
            const width = bounds.width * xCompressor;
            const height = bounds.height * yCompressor;

            if (bounds.width == 0 || bounds.height == 0)
                return setTimeout(resizer, 100);

            // 16px is the test value because it scales linearly
            const test_val = 16;
            context.font = `${test_val}px ${settings.font}`;
            console.log(width, height, el[settings.property])
            const measure = context.measureText(el[settings.property]);
            const measureH =
                measure.actualBoundingBoxAscent +
                measure.actualBoundingBoxDescent;
            const font_size =
                test_val * Math.min(width / measure.width, height / 18.4);
            // const font_size = test_val*height/measureH
            el.style.fontSize = font_size + "px";
        };

        // Call once to set.
        resizer();

        addEvent(window, "resize", resizer);
        addEvent(window, "change", resizer);
        addEvent(window, "orientationchange", resizer);
    };

    if (el.length) for (var i = 0; i < el.length; i++) fit(el[i]);
    else fit(el);

    // return set of elements
    return el;
};

export default fitText