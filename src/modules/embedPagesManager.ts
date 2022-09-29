import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedField,
  ColorResolvable,
  CommandInteraction,
  ButtonInteraction,
} from 'discord.js';

/**
 * A class to easily make an embed with reactions to switch between pages.
 * @see send() to send the embed
 */
export default class EmbedPageManager {
  static checkedInteractions = {};

  private interaction: CommandInteraction;

  private title: string;

  private embedCreator: any;

  private color: ColorResolvable;

  private maxTotalLength: number;

  private currentPageNb: number;

  private pages: any[][];

  private needMultiplePages: boolean;

  /**
   * @param {CommandInteraction} interaction
   *        The interaction that triggered this EmbedPageManager to show up
   * @param {Array<EmbedField>} fields
   *        all fields that will be dispatched into pages.
   *        A field is just an object with a name and a value property.
   * @param {String} title The title for the embed
   * @param {Function} embedCreator
   *        a function that will be called with a Discord.EmbedBuilder
   *        to modify that embed each time the page changed
   * @param {String} color color of the embed
   * @param {number} maxTotalLength max length of field names + field value on one page
   */
  constructor(interaction: CommandInteraction, fields: Array<EmbedField>, title: string, embedCreator?: Function, color: ColorResolvable = '#93ff8a', maxTotalLength: number = 1800) {
    this.interaction = interaction;
    this.title = title;
    this.embedCreator = embedCreator;
    this.color = color;
    this.maxTotalLength = maxTotalLength;

    // generating pages according to the max length
    this.currentPageNb = 0;
    let currentTotalLength = 0;
    this.pages = [[]];
    fields.forEach((field) => {
      const addedLength = field.name.length + field.value.length;
      if (currentTotalLength + addedLength < maxTotalLength) {
        this.pages[this.pages.length - 1].push(field);
        currentTotalLength += addedLength;
      } else {
        this.pages.push([field]);
        currentTotalLength = field.name.length + field.value.length;
      }
    });
    this.needMultiplePages = this.pages.length > 1;
  }

  /**
   * Sends the embed in the previously specified channel;
   */
  async send() {
    await this.interaction.editReply({
      embeds: [this.makeEmbed(this.currentPageNb)],
      // @ts-ignore
      components: [this.makeButtons()],
    });
  }

  /**
   * @private
   */
  makeEmbed(pageNb: number) {
    let embed = new EmbedBuilder();
    if (this.needMultiplePages) embed.setTitle(`${this.title} (${pageNb + 1}/${this.pages.length})`);
    else embed.setTitle(this.title);
    embed.setColor(this.color);
    embed.addFields(...this.pages[pageNb]);
    if (this.embedCreator !== undefined) embed = this.embedCreator(embed);
    return embed;
  }

  /**
   * @private
   */
  makeButtons() {
    const now = Date.now();
    const previousID = `EPM-previous-${now}`;
    const nextID = `EPM-next-${now}`;
    const buttons = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(previousID)
        .setLabel('Previous Page')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(this.currentPageNb <= 0),
      new ButtonBuilder()
        .setCustomId(nextID)
        .setLabel('Next Page')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(this.currentPageNb >= this.pages.length - 1),
    );
    /* eslint-disable max-len */
    // @ts-ignore
    EmbedPageManager.checkedInteractions[previousID] = (interaction: ButtonInteraction) => {
      if (this.currentPageNb <= 0) return;
      interaction.update({
        embeds: [this.makeEmbed(this.currentPageNb -= 1)],
        components: [this.makeButtons()],
      });
    };
    // @ts-ignore
    EmbedPageManager.checkedInteractions[nextID] = (interaction: ButtonInteraction) => {
      if (this.currentPageNb >= this.pages.length - 1) return;
      interaction.update({
        embeds: [this.makeEmbed(this.currentPageNb += 1)],
        components: [this.makeButtons()],
      });
    };

    return buttons;
  }

  /**
   *
   * @param {ButtonInteraction} interaction
   */
  static async checkButtonInteraction(interaction: { customId: string | number; }) {
    // @ts-ignore
    const func = EmbedPageManager.checkedInteractions[interaction.customId];
    if (func !== undefined) func(interaction);
  }
}
