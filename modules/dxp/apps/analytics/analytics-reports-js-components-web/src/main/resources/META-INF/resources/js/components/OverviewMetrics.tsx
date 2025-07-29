/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import ClayLoadingIndicator from '@clayui/loading-indicator';
import React, {useContext, useEffect} from 'react';

import {Context} from '../Context';
import OverviewMetric from '../components/OverviewMetric';
import useFetch from '../hooks/useFetch';
import {
	AssetTypes,
	Individuals,
	MetricName,
	MetricType,
	RangeSelectors,
} from '../types/global';
import {buildQueryString} from '../utils/buildQueryString';
import {TrendClassification, assetMetrics} from '../utils/metrics';

type MetricData = {
	metricType: MetricType;
	trend: {
		percentage?: number;
		trendClassification: TrendClassification;
	};
	value: number;
};

type Data = {
	assetId: string;
	assetType: AssetTypes;
	defaultMetric: MetricData;
	selectedMetrics: MetricData[];
};

type Metrics = {
	[key in MetricType]: string;
};

export const MetricsTitle: Metrics = {
	[MetricType.Comments]: Liferay.Language.get('comments'),
	[MetricType.Downloads]: Liferay.Language.get('downloads'),
	[MetricType.Impressions]: Liferay.Language.get('impressions'),
	[MetricType.Undefined]: Liferay.Language.get('undefined'),
	[MetricType.Views]: Liferay.Language.get('views'),
};

interface IOverviewMetricsWithDataProps {
	data: Data;
}

const OverviewMetricsWithData: React.FC<IOverviewMetricsWithDataProps> = ({
	data,
}) => {
	const {changeMetricFilter, filters} = useContext(Context);

	useEffect(() => {
		if (filters.metric === MetricType.Undefined) {
			changeMetricFilter(data.defaultMetric.metricType);
		}
	}, [changeMetricFilter, data.defaultMetric.metricType, filters.metric]);

	return (
		<div className="overview-metrics">
			{data.selectedMetrics.map(({metricType, trend, value}) => (
				<OverviewMetric
					key={metricType}
					name={MetricsTitle[metricType]}
					onSelectMetric={() => changeMetricFilter(metricType)}
					selected={filters.metric === metricType}
					trend={{
						percentage: trend.percentage ?? 0,
						trendClassification: trend.trendClassification,
					}}
					value={value}
				/>
			))}
		</div>
	);
};

export type AssetMetricProps = {
	assetId: string;
	assetType: string;
	groupId: string;
	individual: Individuals;
	rangeSelector: RangeSelectors;
	selectedMetrics: MetricName[];
};

const OverviewMetrics = () => {
	const {assetId, assetType, filters, groupId} = useContext(Context);
	const queryString = buildQueryString({
		assetId,
		identityType: filters.individual,
		rangeKey: filters.rangeSelector,
		selectedMetric: String(assetMetrics[assetType]),
	});

	const {data, loading} = useFetch<Data>(
		`/o/analytics-reports-rest/v1.0/${groupId}/asset-metrics/${assetType}${queryString}`
	);

	if (loading) {
		return <ClayLoadingIndicator className="my-5" />;
	}

	if (!data) {
		return null;
	}

	return <OverviewMetricsWithData data={data} />;
};

export default OverviewMetrics;
