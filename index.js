var winston = require('winston'),
    Logger = winston.Logger,
    Http = winston.transports.Http,
    Console = winston.transports.Console,
    File = winston.transports.File;

var transports = {
    'http': Http,
    'console': Console,
    'file': File
};

function Chill(options) {
    options = options === undefined ? {} : options;

    this.levels = options.levels === undefined ? winston.config.syslog.levels : options.levels;
    var all = Object.keys(this.levels)[0];
    this.level = options.level === undefined ? all : options.level;

    this.host = options.host === undefined ? 'localhost' : options.host;
    this.port = options.port === undefined ? '8080' : options.port;
    this.path = options.path === undefined ? '/winston' : options.path;
    this.ssl = options.ssl === undefined ? false : options.ssl;
    this.colorize = options.colorize === undefined ? true : options.colorize;

    this.env = {
        production: ['http'],
        staging: ['http', 'file'],
        development: ['console']
    };

    this.config = {
        transports: [],
        exceptionHandlers: [],
        rewriters: [],
        exitOnError: false,
        handleExceptions: true,
        emitErrors: true,
        levels: this.levels,
        level: this.level
    };
}

Chill.prototype._add = function(type, transport, options) {
    if (typeof options === 'undefined') {
        options = {};
    }

    if (transport === 'http') {
        options.ssl = options.ssl === undefined ? this.ssl : options.ssl;
        options.host = options.host === undefined ? this.host : options.host;
        options.port = options.port === undefined ? this.port : options.port;
        options.path = options.path === undefined ? this.path : options.path;
    }

    if (transport === 'file') {
        options.filename = options.filename === undefined ? '/tmp/winston.' + require('os').hostname() + '.log' : options.filename;
    }

    if (transport === 'console') {
        options.colorize = options.colorize === undefined ? this.colorize : options.colorize;
    }

    options.level = options.level === undefined ? this.level : options.level;
    options.levels = this.levels;

    if (Object.keys(transports).indexOf(transport) > -1) {
        var Transport = transports[transport];

        var trn = new Transport(options);

        this.config[type].push(trn);
    } else {
        var AlternateTransport = transport;

        this.config[type].push(new AlternateTransport(options));

        this.logger.warning('chill: Added transport without modifying options', transport);
    }
};

Chill.prototype.environment = function(name) {
    if (typeof this.env[name] !== 'undefined') {
        this.env[name].forEach(function(transport) {
            this.add(transport);
            this.handleExceptions(transport);
        }.bind(this));
    }

    return this;
};

Chill.prototype.handleExceptions = function(transport, options) {
    this._add('exceptionHandlers', transport, options);

    return this;
};

Chill.prototype.add = function(transport, options) {
    this._add('transports', transport, options);

    return this;
};

Chill.prototype.rewriteMeta = function(cb) {
    if (!this.logger) {
        this.config.rewriters.push(cb);
    } else {
        this.logger.warning('chill: Cannot add metadata re-writer posthumously');
    }

    return this;
};

Chill.prototype.getLogger = function() {
    if (this.logger === undefined) {
        this.logger = new Logger(this.config);
    }

    return this.logger;
};

module.exports = Chill;
