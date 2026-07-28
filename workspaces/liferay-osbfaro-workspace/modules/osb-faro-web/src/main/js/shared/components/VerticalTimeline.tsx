import ClayIcon from '@clayui/icon';
import ClayLabel from '@clayui/label';
import ClayLink from '@clayui/link';
import ClaySticker from '@clayui/sticker';
import getCN from 'classnames';
import Loading from 'shared/components/Loading';
import React, {FC, useState} from 'react';
import TextTruncate from './TextTruncate';
import {Colors} from 'shared/util/colors-size';
import {formatDateToTimeZone} from 'shared/util/date';
import {isWebhookUserAgent} from 'shared/util/activities';
import {LIFERAY_DXP_APPLICATION_IDS} from 'shared/util/constants';
import {sub} from 'shared/util/lang';

const TIME_FORMAT = 'h:mm a';

const DEVICE_ICONS_MAP = {
	any: {
		color: Colors.MainLighten65,
		id: 'anyIcon',
		symbol: 'devices',
		title: Liferay.Language.get('unknown-device'),
	},
	desktop: {symbol: 'display', title: Liferay.Language.get('desktop')},
	mobile: {symbol: 'mobile-portrait', title: Liferay.Language.get('mobile')},
	smartphone: {
		symbol: 'mobile-portrait',
		title: Liferay.Language.get('mobile'),
	},
	tablet: {
		symbol: 'tablet-landscape',
		title: Liferay.Language.get('tablet'),
	},
};

const normalizeApplicationId = (applicationId: string): string =>
	LIFERAY_DXP_APPLICATION_IDS.has(applicationId) ? 'DXP' : applicationId;

type ITEM_SHAPE = {
	applicationId?: string;
	attributes?: Record<string, unknown>;
	browserName?: string;
	description?: string;
	descriptionUrl?: string;
	device?: string;
	endTime?: number | string | null;
	header?: boolean;
	individualId?: string;
	individualName?: string;
	individualUrl?: string;
	isAnonymous?: boolean;
	nestedItems?: ITEM_SHAPE[];
	noTimestamps?: boolean;
	pageGroup?: boolean;
	session?: boolean;
	subtitle?: string;
	time?: string;
	title?: string;
	totalEvents?: number;
	userAgent?: string;
};

type IRowProps = {
	initialExpanded?: boolean;
	item: ITEM_SHAPE;
	LDPEnabled?: boolean;

	// The session's own attributes (browser, device, screen size…), threaded
	// down so a page row can reveal them without the session row showing its raw
	// attributes structure up front.

	sessionAttributes?: Record<string, unknown>;
	timeZoneId: string;
};

/**
 * The clickable part of a row: everything but the content it reveals. The caret
 * lives here so every expandable row carries it in the same place, on the right.
 */
const RowMain: FC<{
	children: React.ReactNode;
	expanded: boolean;
	onToggle: () => void;
}> = ({children, expanded, onToggle}) => (
	<div
		className="row-main d-flex align-items-start"
		onClick={onToggle}
		onKeyPress={onToggle}
		role="button"
		tabIndex={0}
	>
		{children}

		<ClayIcon
			className="caret-icon icon-root ml-3 flex-shrink-0 text-secondary"
			symbol={expanded ? 'caret-top' : 'caret-bottom'}
		/>
	</div>
);

const EventCountPill: FC<{totalEvents?: number}> = ({totalEvents}) =>
	totalEvents === undefined ? null : (
		<span className="event-count-pill align-items-center d-inline-flex flex-shrink-0 font-weight-semi-bold text-secondary">
			<ClayIcon className="icon-root" symbol="click" />

			<span className="event-count ml-1">{totalEvents}</span>
		</span>
	);

const DeviceIcon: FC<{browserName?: string; device?: string}> = ({
	browserName,
	device = '',
}) => {
	const {title, ...otherIconAttributes} =
		(DEVICE_ICONS_MAP as any)[device.toLowerCase()] || DEVICE_ICONS_MAP.any;

	return (
		<span
			className="device-icon align-items-center d-inline-flex flex-shrink-0"
			data-tooltip
			data-tooltip-align="bottom"
			title={[title, browserName].filter(Boolean).join('\n')}
		>
			<ClayIcon
				className="icon-root text-secondary"
				{...otherIconAttributes}
			/>
		</span>
	);
};

/**
 * Names the data source the session came from: `DXP` for anything Liferay
 * produced, the application id itself for an external source reaching Analytics
 * Cloud through a webhook.
 */
const DataSourceLabel: FC<{applicationId?: string; isWebhook: boolean}> = ({
	applicationId,
	isWebhook,
}) =>
	applicationId ? (
		<ClayLabel
			className={getCN(
				'data-source-label',
				'flex-shrink-0',
				'font-weight-semi-bold',
				'm-0',
				{
					'label-info': !isWebhook,
					'label-success': isWebhook,
				}
			)}
			displayType={isWebhook ? 'success' : 'info'}
		>
			<strong>
				{normalizeApplicationId(applicationId).toUpperCase()}
			</strong>
		</ClayLabel>
	) : null;

const ExternalLink: FC<{url: string}> = ({url}) => (
	<ClayLink
		className="subtitle align-items-center align-self-start d-inline-flex font-weight-normal mw-100 text-secondary"
		href={url}
		rel="noopener noreferrer"
		target="_blank"
	>
		<TextTruncate title={url} />

		<ClayIcon className="ml-2" fontSize={12} symbol="shortcut" />
	</ClayLink>
);

const RowAttributes: FC<{payload: Record<string, unknown>}> = ({payload}) => (
	<code className="attributes-payload text-secondary d-block w-100">
		{JSON.stringify(payload, null, 2)}
	</code>
);

const DayRow: FC<{item: ITEM_SHAPE}> = ({item: {title, totalEvents}}) => (
	<li className="timeline-row day-row p-3 bg-white w-100 d-flex align-items-center">
		<ClayIcon
			className="day-icon icon-root text-secondary mr-2"
			symbol="calendar"
		/>

		<span className="title text-dark">{title}</span>

		<EventCountPill totalEvents={totalEvents} />
	</li>
);

/**
 * A session, and — on the first session of an individual's day — the individual
 * it belongs to. Expanding it reveals the pages visited during the session as a
 * clean summary — the session's raw attributes only surface one level deeper,
 * when a specific page row is expanded.
 */
const SessionRow: FC<IRowProps> = ({
	LDPEnabled,
	initialExpanded,
	item: {
		applicationId,
		attributes,
		browserName,
		device,
		endTime,
		individualId,
		individualName,
		individualUrl,
		isAnonymous,
		nestedItems,
		noTimestamps,
		time,
		totalEvents,
		userAgent,
	},
	timeZoneId,
}) => {
	const [expanded, setExpanded] = useState<boolean>(!!initialExpanded);

	const getEndLabel = () => {
		if (noTimestamps) {
			return Liferay.Language.get('no-timestamps').toLowerCase();
		}

		if (endTime) {
			return formatDateToTimeZone(endTime, TIME_FORMAT, timeZoneId);
		}

		return Liferay.Language.get('in-progress').toLowerCase();
	};

	return (
		<li
			className={getCN(
				'timeline-row',
				'session-row',
				'bg-white',
				'w-100',
				{expanded}
			)}
		>
			<RowMain
				expanded={expanded}
				onToggle={() => setExpanded(!expanded)}
			>
				<div className="row-content flex-fill">
					<div className="individual">
						{individualName && (
							<ClaySticker
								className="individual-sticker"
								shape="user-icon"
							>
								<ClayIcon
									color="gray"
									symbol={isAnonymous ? 'anonymize' : 'user'}
								/>
							</ClaySticker>
						)}

						<div className="individual-info">
							{individualName &&
								(individualUrl ? (
									<ClayLink
										className="individual-name text-primary"
										href={individualUrl}
									>
										{individualName}
									</ClayLink>
								) : (
									<span className="individual-name text-primary">
										{individualName}
									</span>
								))}

							{individualId && (
								<div className="individual-id text-secondary">
									{individualId}
								</div>
							)}

							<div className="session-label text-secondary">
								{sub(Liferay.Language.get('session-x-x'), [
									time
										? formatDateToTimeZone(
												time,
												TIME_FORMAT,
												timeZoneId
											)
										: '',
									getEndLabel(),
								])}
							</div>
						</div>
					</div>
				</div>

				<div className="row-details ml-auto pl-3 d-flex align-items-center">
					{LDPEnabled && (
						<DataSourceLabel
							applicationId={applicationId}
							isWebhook={isWebhookUserAgent(userAgent)}
						/>
					)}

					<EventCountPill totalEvents={totalEvents} />

					<DeviceIcon browserName={browserName} device={device} />
				</div>
			</RowMain>

			{expanded && !!nestedItems?.length && (
				<VerticalTimeline
					items={nestedItems}
					LDPEnabled={LDPEnabled}
					nested
					sessionAttributes={attributes}
					timeZoneId={timeZoneId}
				/>
			)}
		</li>
	);
};

/**
 * Every event of one visited page, collapsed into a single row: the page title
 * links to its dashboard, the URL opens the page itself, and the pill counts the
 * events the row stands for. Expanding it reveals those events, plus the
 * session's raw attributes (browser, device, screen size…), which are only
 * shown at this level, not on the session row itself.
 */
const PageGroupRow: FC<IRowProps> = ({
	LDPEnabled,
	item: {descriptionUrl, nestedItems, subtitle, time, title, totalEvents},
	sessionAttributes,
	timeZoneId,
}) => {
	const [expanded, setExpanded] = useState<boolean>(false);

	return (
		<li
			className={getCN('timeline-row', 'page-row', 'bg-white', 'w-100', {
				expanded,
			})}
		>
			<RowMain
				expanded={expanded}
				onToggle={() => setExpanded(!expanded)}
			>
				<div className="row-content flex-fill">
					<div className="page-header">
						<span className="row-time text-secondary flex-shrink-0 font-weight-semi-bold text-right">
							{time &&
								formatDateToTimeZone(
									time,
									TIME_FORMAT,
									timeZoneId
								)}
						</span>

						<ClayIcon
							className="row-icon icon-root text-secondary mt-0 flex-shrink-0"
							symbol="page"
						/>

						{descriptionUrl ? (
							<ClayLink
								className="title text-dark"
								href={descriptionUrl}
							>
								<TextTruncate title={title ?? ''} />
							</ClayLink>
						) : (
							<span className="title text-dark">
								<TextTruncate title={title ?? ''} />
							</span>
						)}
					</div>

					<div className="page-info">
						{subtitle && <ExternalLink url={subtitle} />}

						<EventCountPill totalEvents={totalEvents} />
					</div>
				</div>
			</RowMain>

			{expanded && (
				<>
					{!!sessionAttributes && (
						<RowAttributes payload={sessionAttributes} />
					)}

					{!!nestedItems?.length && (
						<VerticalTimeline
							items={nestedItems}
							LDPEnabled={LDPEnabled}
							nested
							timeZoneId={timeZoneId}
						/>
					)}
				</>
			)}
		</li>
	);
};

/**
 * A single event. Expanding it reveals its raw attributes.
 */
const EventRow: FC<IRowProps> = ({
	item: {attributes, description, descriptionUrl, subtitle, time, title},
	timeZoneId,
}) => {
	const [expanded, setExpanded] = useState<boolean>(false);

	return (
		<li
			className={getCN('timeline-row', 'event-row', 'bg-white', 'w-100', {
				expanded,
			})}
		>
			<RowMain
				expanded={expanded}
				onToggle={() => setExpanded(!expanded)}
			>
				<div className="row-content flex-fill">
					<div className="event-header">
						<span className="row-time text-secondary flex-shrink-0 font-weight-semi-bold text-right">
							{time &&
								formatDateToTimeZone(
									time,
									TIME_FORMAT,
									timeZoneId
								)}
						</span>

						<span className="title text-dark">
							<TextTruncate title={title ?? ''} />
						</span>
					</div>

					<div className="event-info">
						{description && (
							<div className="description align-self-start font-weight-normal mw-100 text-secondary">
								{descriptionUrl ? (
									<ClayLink
										className="description-link font-weight-normal text-secondary"
										href={descriptionUrl}
									>
										<TextTruncate title={description} />
									</ClayLink>
								) : (
									<TextTruncate title={description} />
								)}
							</div>
						)}

						{subtitle && <ExternalLink url={subtitle} />}
					</div>
				</div>
			</RowMain>

			{expanded && !!attributes && <RowAttributes payload={attributes} />}
		</li>
	);
};

const TimelineRow: FC<IRowProps> = (props) => {
	const {header, pageGroup, session} = props.item;

	if (header) {
		return <DayRow item={props.item} />;
	}

	if (session) {
		return <SessionRow {...props} />;
	}

	if (pageGroup) {
		return <PageGroupRow {...props} />;
	}

	return <EventRow {...props} />;
};

type IVerticalTimelineProps = {
	initialExpanded?: boolean;
	items: ITEM_SHAPE[];
	LDPEnabled?: boolean;
	loading?: boolean;
	nested?: boolean;
	sessionAttributes?: Record<string, unknown>;
	timeZoneId: string;
};

/**
 * Renders the activity stream as a list of rows: day, session, visited page and
 * event. Each level reveals the next one when expanded, so the stream reads as a
 * summary until the marketer drills into it.
 */
const VerticalTimeline: FC<IVerticalTimelineProps> = ({
	initialExpanded,
	items = [],
	LDPEnabled = true,
	loading = false,
	nested = false,
	sessionAttributes,
	timeZoneId,
}) =>
	loading ? (
		<Loading />
	) : (
		<div className="vertical-timeline-root">
			<ul className={getCN('timeline-rows', {nested})}>
				{items.map((item, i) => (
					<TimelineRow
						initialExpanded={initialExpanded}
						item={item}
						key={i}
						LDPEnabled={LDPEnabled}
						sessionAttributes={sessionAttributes}
						timeZoneId={timeZoneId}
					/>
				))}
			</ul>
		</div>
	);

export default VerticalTimeline;
