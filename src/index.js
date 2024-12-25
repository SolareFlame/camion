const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { config } = require('dotenv');
const path = require('path');
const { readdirSync } = require('fs');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
    ],
});

client.commands = new Collection();
const commandFiles = readdirSync(path.join(__dirname, 'commands')).filter(file => file.endsWith('.js'));

const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN);

client.once('ready', async () => {
    console.log('Bot is online!');

    try {
        const commands = commandFiles.map(file => {
            console.log(`[INDEX] : Enregistrement de la commande ${file}`);

            const command = require(`./commands/${file}`);
            client.commands.set(command.data.name, command);
            return command.data.toJSON();
        });

        await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), {
            body: commands,
        });

        console.log('[INDEX] : Toutes les commandes ont été enregistrées avec succès.');
    } catch (error) {
        console.error('[INDEX] : Erreur lors de l\'enregistrement des commandes:', error);
    }
});

client.on('interactionCreate', async (interaction) => {
    if(interaction.isButton()) {
        const btn = client.commands.get(interaction.customId);
        if (!btn) return;

        try {
            console.log('[BUTTON] : Exectution de la commande : ' + btn.data.name);

            await btn.execute(interaction);
        } catch (error) {
            console.error(error);
            if(interaction) await interaction.editReply({ content: 'Il y a eu une erreur lors de l\'exécution de la commande.', ephemeral: true });
        }
    }

    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        if(interaction) await interaction.editReply({ content: 'Il y a eu une erreur lors de l\'exécution de la commande.', ephemeral: true });
    }
});

client.login(process.env.DISCORD_TOKEN).catch(console.error);