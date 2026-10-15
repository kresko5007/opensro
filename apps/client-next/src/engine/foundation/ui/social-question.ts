/*
===========================================================================

social-question.ts - the question a guild or party action asks first

Secede and Disband (the guild manager's rows), a guild nickname (box
0x17, 5E35E0) and the party ban ask their native question before
anything is sent. The guild window's Withdraw
(UIIT_STT_GUILD_EXPULSION, the ban) asks nothing: 5E4C30 sends it on the
click, and UIIT_MSG_GUILD_QUESTION_EXPULSION_ANYONE is never shown by
v1.150. The window draws the box (simpleMessageBox); Yes sends the action,
No drops it.

===========================================================================
*/

/*
================
SocialQuestionGuild

What the questions read of the player's own guild.
================
*/
export interface SocialQuestionGuild {
	readonly name?: string;
}

/*
================
SocialQuestionLine

One line of the question: a text key, and the names its %s stand for, in
order.
================
*/
export interface SocialQuestionLine {
	readonly key: string;
	readonly args?: readonly string[];
}

/*
================
SocialQuestionGrant

The nickname box 0x17 asks about: the member's name and the nickname.
================
*/
export interface SocialQuestionGrant {
	readonly member: string;
	readonly name: string;
}

/*
================
SocialQuestion
================
*/
export interface SocialQuestion {
	readonly title: string;
	readonly lines: readonly SocialQuestionLine[];
}

/*
================
socialQuestion

The native question for an armed action: secede (EXIT1 with the guild's,
then EXIT2's 72-hour warning), disband (BREAK_CONFIRM), a nickname
(52F460 case 0x16: QUESTION_NAME_GRANT with the member, then the
nickname) and the party ban. Null when nothing is asked. The window
resolves the text keys.
================
*/
export function socialQuestion(
	asked: string,
	guild: SocialQuestionGuild | null | undefined,
	grant?: SocialQuestionGrant | null
): SocialQuestion | null {
	switch ( asked ) {
		case "guild-leave":
			return {
				title: "UIIT_STT_GUILD_EXIT",
				lines: [ { key: "UIIT_MSG_GUILD_QUESTION_EXIT1", args: [ guild?.name ?? "" ] }, {
					key: "UIIT_MSG_GUILD_QUESTION_EXIT2"
				} ]
			};
		case "guild-dissolve":
			return { title: "UIIT_CTL_GUILD_BREAK", lines: [ { key: "UIIT_MSG_GUILD_BREAK_CONFIRM" } ] };
		case "guild-title":
			return grant ?
				{
					title: "UIIT_STT_CONFIRM_BOX",
					lines: [ { key: "UIIT_MSG_GUILD_QUESTION_NAME_GRANT", args: [ grant.member, grant.name ] } ]
				} :
				null;
		case "party-kick":
			return { title: "UIIT_STT_AGREEMENT_BOX", lines: [ { key: "UIIT_MSG_PARTY_BAN_REQUEST" } ] };
	}
	return null;
}
