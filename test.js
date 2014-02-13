var Chill = require('./index');

var logger = new Chill()
                 .environment('development')
                 .getLogger();

logger.info('This is a winston log!');

var logger2 = new Chill()
                 .rewriteMeta(function(level, log, meta) {
                     meta.hostname = require('os').hostname();
                     return meta;
                 })
                 .environment('staging')
                 .getLogger();

logger2.info('This is a staging log');

var logger3 = new Chill({host: 'localhost', port: 443, ssl: true})
                 .rewriteMeta(function(level, log, meta) {
                     meta.hostname = require('os').hostname();
                     return meta;
                 })
                 .environment('production')
                 .getLogger();

logger3.info('This is a production log');