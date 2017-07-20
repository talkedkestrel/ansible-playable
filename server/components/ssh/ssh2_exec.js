const Client = require('ssh2').Client;

const config = require('../../config/environment');
const logger = require('../logger/logger');

exports.executeCommand = function(command, dataCallback,completeCallback,errorCallback, ansibleEngine, addScriptEndString){

  var conn = new Client();

  if(!ansibleEngine) ansibleEngine = {};

  var connHost = ansibleEngine.ansibleHost || config.scriptEngine.host;
  var connUser = ansibleEngine.ansibleHostUser || config.scriptEngine.user;
  var connHostPassword = ansibleEngine.ansibleHostPassword || config.scriptEngine.password;

  var scriptEngineConfig = {
    host: connHost,
    port: 22,
    username: connUser,
    tryKeyboard: true
  };

  if(connHostPassword){
    scriptEngineConfig.password = connHostPassword;
  }else{
    scriptEngineConfig.privateKey = require('fs').readFileSync(config.scriptEngine.privateKey);
  }

  conn.on('keyboard-interactive', function(name, instr, lang, prompts, cb) {
    cb([connHostPassword]);
  });

  conn.on('error', function(error) {
    logger.error("SSH Connect Error" + error);
    errorCallback("SSH Connect Error" + error);
  });

  conn.on('ready', function() {
    logger.info('Client :: ready');
    conn.exec(command, function(err, stream) {
      var callBackSent = false;

      var result_data = "";
      var error_data = "";
      var error = false;

      if (err) {
        logger.error("Error=" + err);
        errorCallback("Error=" + err);
      }
      stream.on('close', function(code, signal) {
        logger.info('Stream :: close :: code: ' + code + ', signal: ' + signal);
        if(addScriptEndString){
          result_data += '\nSCRIPT_FINISHED';
          dataCallback(result_data);
        }

        if(code !== 0){
          errorCallback(error_data)
        }else{
          completeCallback(result_data)
        }
        conn.end();
      }).on('data', function(data) {
        logger.info('STDOUT: ' + data);
        result_data += data;
        if(dataCallback){
          dataCallback(result_data);
        }

      }).stderr.on('data', function(data) {
        logger.error('STDERR: ' + data);
        error_data += data;
        error = true;

      });
    });
  }).connect(scriptEngineConfig);
};

