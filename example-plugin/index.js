const examplePlugin = {
    init: (client) => {
        client.logger.info(`[Example Plugin] Hello there! ${client.user.tag} you are in ${client.guilds.cache.size} guilds!`);
    }
};

module.exports = examplePlugin;