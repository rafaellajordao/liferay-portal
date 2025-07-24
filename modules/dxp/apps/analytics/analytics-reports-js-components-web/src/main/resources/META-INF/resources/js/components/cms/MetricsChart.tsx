/**
 * SPDX-FileCopyrightText: (c) 2025 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import React, {useContext} from 'react';

import {AnalyticsReportsContext} from '../../AnalyticsReportsContext';
import {MetricName} from '../../types/global';
import {TableView} from './TableView';
import CurrentVsPreviousChart from './current-vs-previous/CurrentVsPreviousChart';

const mockedChartData = {
	histograms: [
		{
			metricName: MetricName.Views,
			metrics: [
				{
					previousValue: 210000,
					previousValueKey: '2025-04-19T17:00',
					value: 130000,
					valueKey: '2025-04-20T17:00',
				},
				{
					previousValue: 110000,
					previousValueKey: '2025-04-19T18:00',
					value: 320000,
					valueKey: '2025-04-20T18:00',
				},
				{
					previousValue: 300000,
					previousValueKey: '2025-04-19T19:00',
					value: 330000,
					valueKey: '2025-04-20T19:00',
				},
				{
					previousValue: 330000,
					previousValueKey: '2025-05-19T20:00',
					value: 310000,
					valueKey: '2025-05-20T20:00',
				},
				{
					previousValue: 380000,
					previousValueKey: '2025-05-19T21:00',
					value: 120000,
					valueKey: '2025-05-20T21:00',
				},
				{
					previousValue: 120000,
					previousValueKey: '2025-06-19T22:00',
					value: 370000,
					valueKey: '2025-06-20T22:00',
				},
				{
					previousValue: 270000,
					previousValueKey: '2025-06-19T23:00',
					value: 100000,
					valueKey: '2025-06-20T23:00',
				},
				{
					previousValue: 210000,
					previousValueKey: '2025-07-20T00:00',
					value: 180000,
					valueKey: '2025-07-21T00:00',
				},
				{
					previousValue: 420000,
					previousValueKey: '2025-07-20T01:00',
					value: 840000,
					valueKey: '2025-07-21T01:00',
				},
				{
					previousValue: 200000,
					previousValueKey: '2025-08-20T02:00',
					value: 280000,
					valueKey: '2025-08-21T02:00',
				},
				{
					previousValue: 20000,
					previousValueKey: '2025-08-20T03:00',
					value: 410000,
					valueKey: '2025-08-21T03:00',
				},
				{
					previousValue: 120000,
					previousValueKey: '2025-09-20T04:00',
					value: 210000,
					valueKey: '2025-09-21T04:00',
				},
				{
					previousValue: 10000,
					previousValueKey: '2025-09-20T05:00',
					value: 310000,
					valueKey: '2025-09-21T05:00',
				},
				{
					previousValue: 130000,
					previousValueKey: '2025-09-20T06:00',
					value: 410000,
					valueKey: '2025-09-21T06:00',
				},
				{
					previousValue: 330000,
					previousValueKey: '2025-10-20T10:00',
					value: 230000,
					valueKey: '2025-10-21T10:00',
				},
				{
					previousValue: 380000,
					previousValueKey: '2025-10-20T08:00',
					value: 390000,
					valueKey: '2025-10-21T08:00',
				},
				{
					previousValue: 360000,
					previousValueKey: '2025-10-20T09:00',
					value: 290000,
					valueKey: '2025-10-21T09:00',
				},
				{
					previousValue: 330000,
					previousValueKey: '2025-10-20T10:00',
					value: 260000,
					valueKey: '2025-10-21T10:00',
				},
				{
					previousValue: 190000,
					previousValueKey: '2025-10-20T11:00',
					value: 300000,
					valueKey: '2025-10-21T11:00',
				},
				{
					previousValue: 220000,
					previousValueKey: '2025-11-20T12:00',
					value: 470000,
					valueKey: '2025-11-21T12:00',
				},
				{
					previousValue: 210000,
					previousValueKey: '2025-11-20T13:00',
					value: 940000,
					valueKey: '2025-11-21T13:00',
				},
				{
					previousValue: 70000,
					previousValueKey: '2025-11-20T14:00',
					value: 230000,
					valueKey: '2025-11-21T14:00',
				},
				{
					previousValue: 70000,
					previousValueKey: '2025-11-20T15:00',
					value: 320000,
					valueKey: '2025-11-21T15:00',
				},
				{
					previousValue: 210000,
					previousValueKey: '2025-11-20T16:00',
					value: 30000,
					valueKey: '2025-11-21T16:00',
				},
			],
			total: 1231,
			totalValue: 3000,
		},
	],
};

const MetricsChart = () => {
	const {filters} = useContext(AnalyticsReportsContext);

	return (
		<CurrentVsPreviousChart
			data={mockedChartData}
			metricType={filters.metric}
		/>
	);
};

const TableViewMetric = () => {
	const {filters} = useContext(AnalyticsReportsContext);

	return <TableView data={mockedChartData} metricType={filters.metric} />;
};

export {MetricsChart};
export {TableViewMetric};
