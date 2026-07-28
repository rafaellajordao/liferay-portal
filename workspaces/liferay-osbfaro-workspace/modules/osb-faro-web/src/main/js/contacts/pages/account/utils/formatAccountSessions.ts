import {AccountUserSession} from 'shared/queries/AccountUserSessionQuery';
import {EventDashboardContext} from 'shared/util/getEventDashboardUrl';
import {
	groupEventsByPage,
	groupSessionsByDay,
	isWebhookUserAgent,
	VerticalTimelineHeader,
	VerticalTimelineSession,
} from 'shared/util/activities';
import {Routes, toRoute} from 'shared/util/router';
import {UserSessionEvent} from 'shared/queries/UserSessionQuery';

const ANONYMOUS_KEY = '__anonymous__';

type Individual = Pick<
	VerticalTimelineSession,
	'individualId' | 'individualName' | 'individualUrl' | 'isAnonymous'
>;

/**
 * Resolves the individual shown on a session row. A session that carries an
 * `individualId` is a known individual (the user icon); one without is anonymous
 * (the anonymize icon). An anonymous session always displays the generic
 * "Anonymous User" label — never the tracked `userName`, which would otherwise
 * read as if the visitor were identified — and its raw id goes on a second line,
 * since the anonymous label carries no information on its own. Either way the
 * name links to the profile page — by `individualId` when present, otherwise by
 * `userId` — as long as one of the two ids is available.
 */
const getIndividual = (
	{individualId, userId, userName}: AccountUserSession,
	{channelId, groupId}: EventDashboardContext
): Individual => {
	const isAnonymous = !individualId;

	const linkId = individualId || userId;

	return {
		...(isAnonymous && userId && {individualId: userId}),
		individualName: isAnonymous
			? Liferay.Language.get('anonymous-user')
			: userName || userId || '',
		...(linkId &&
			channelId &&
			groupId && {
				individualUrl: toRoute(Routes.CONTACTS_INDIVIDUAL, {
					channelId,
					groupId,
					id: linkId,
				}),
			}),
		isAnonymous,
	};
};

const toSessionItem = (
	session: AccountUserSession,
	context: EventDashboardContext,
	individual?: Individual
): VerticalTimelineSession => {
	const events = (session.events ?? []) as unknown as UserSessionEvent[];

	return {
		...individual,
		applicationId: events[0]?.applicationId ?? '',
		attributes: {
			contentLanguageId: session.contentLanguageId,
			devicePixelRatio: session.devicePixelRatio,
			header: Liferay.Language.get('session-attributes'),
			languageId: session.languageId,
			screenHeight: session.screenHeight,
			screenWidth: session.screenWidth,
			timezoneOffset: session.timezoneOffset,
			userAgent: session.userAgent,
		},
		browserName: session.browserName,
		device: session.deviceType,
		endTime: session.completeDate,
		nestedItems: groupEventsByPage(events, session.userAgent, context),
		noTimestamps: isWebhookUserAgent(session.userAgent),
		session: true,
		time: session.createDate,
		totalEvents: events.length,
		userAgent: session.userAgent,
	};
};

/**
 * Formats account user sessions for the shared VerticalTimeline. The sessions
 * are grouped by day and then by individual, and the individual is shown on the
 * row of their first session of the day — their remaining sessions of that day
 * render as plain session rows. Inside each session the events are grouped by
 * the page they happened on (see `groupEventsByPage`), so the stream reads as a
 * list of visited pages rather than a list of raw events.
 *
 * Unlike the individual timeline's shared `formatSessions`, this reads the
 * correct session field names, so account session attributes populate.
 */
export const formatAccountSessions = (
	sessions: AccountUserSession[] = [],
	context: EventDashboardContext = {}
): (VerticalTimelineHeader | VerticalTimelineSession)[] => {
	const items: (VerticalTimelineHeader | VerticalTimelineSession)[] = [];

	groupSessionsByDay(sessions).forEach(({daySessions, header}) => {
		items.push(header);

		const sessionsByIndividual = new Map<string, AccountUserSession[]>();

		daySessions.forEach((session) => {
			const individualKey =
				session.individualId ??
				session.userId ??
				session.userName ??
				ANONYMOUS_KEY;

			const individualSessions =
				sessionsByIndividual.get(individualKey) ?? [];

			individualSessions.push(session);

			sessionsByIndividual.set(individualKey, individualSessions);
		});

		sessionsByIndividual.forEach((individualSessions) => {
			const individual = getIndividual(individualSessions[0], context);

			individualSessions.forEach((session, index) =>
				items.push(
					toSessionItem(
						session,
						context,
						index === 0 ? individual : undefined
					)
				)
			);
		});
	});

	return items;
};

export default formatAccountSessions;
