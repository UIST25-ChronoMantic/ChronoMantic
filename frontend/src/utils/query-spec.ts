import { QuerySpec, QuerySpecWithSource, ScopeCondition, ScopeConditionWithSource, ScopeConditionWithSourceWithUnit, ThresholdCondition, Unit, Trend, TrendWithSource, SingleRelation, SingleRelationWithSource, TrendGroup, TrendGroupWithSource, GroupRelation, GroupRelationWithSource, TrendCategory } from "../types/QuerySpec";

export const TrendTextMap: Record<keyof Trend, string> = {
	"slope_scope_condition": "Slope",
	"relative_slope_scope_condition": "Relative Slope",
	"duration_condition": "Duration",
	"category": "Category",
}

export function getSecondsByUnit(unit?: Unit): number {
    if (!unit) return 1;
    switch (unit) {
        case Unit.SECOND: return 1;
        case Unit.MINUTE: return 60;
        case Unit.HOUR: return 3600;
        case Unit.DAY: return 86400;
        case Unit.WEEK: return 86400 * 7;
        case Unit.MONTH: return 86400 * 30;
        case Unit.YEAR: return 86400 * 365;
        default: return 1;
    }
}

export function getUnitBySeconds(seconds: number): Unit {
    if (seconds >= 86400 * 365) return Unit.YEAR;
    if (seconds >= 86400 * 30) return Unit.MONTH;
    if (seconds >= 86400 * 7) return Unit.WEEK;
    if (seconds >= 86400) return Unit.DAY;
    if (seconds >= 3600) return Unit.HOUR;
    if (seconds >= 60) return Unit.MINUTE;
    if (seconds >= 1) return Unit.SECOND;
    return Unit.NUMBER;
}

export function formatQuerySpec(query: QuerySpecWithSource): QuerySpec {
    const formatScopeCondition = (scope?: ScopeConditionWithSource | ScopeConditionWithSourceWithUnit, formatter?: (a: number, b: number) => number): ScopeCondition | undefined => {
        if (!scope) return undefined;
        if (query.text_sources[scope.text_source_id]?.disabled) return undefined;
        
        if (!formatter) formatter = (a, b) => a * b;

        const convertValue = (threshold?: ThresholdCondition, unit?: Unit, formatter?: (a: number, b: number) => number): ThresholdCondition | undefined => {
            if (!threshold || !formatter) return undefined;

            if (unit) {
                return {
                    value: formatter(threshold.value, getSecondsByUnit(unit)),
                    inclusive: threshold.inclusive
                };
            }

            return {
                value: threshold.value,
                inclusive: threshold.inclusive
            };
        };

        const scopeWithUnit = scope as ScopeConditionWithSourceWithUnit;

        return {
            max: convertValue(scope.max, scopeWithUnit.unit, formatter),
            min: convertValue(scope.min, scopeWithUnit.unit, formatter)
        };
    };

    // 格式化 Trend
    const formatTrend = (trend: TrendWithSource): Trend => ({
        category: query.text_sources[trend.category.text_source_id]?.disabled ? TrendCategory.ARBITRARY : trend.category.category,
        slope_scope_condition: formatScopeCondition(trend.slope_scope_condition, (a, b) => a / b),
        relative_slope_scope_condition: formatScopeCondition(trend.relative_slope_scope_condition),
        duration_condition: formatScopeCondition(trend.duration_condition)
    });

    // 格式化 SingleRelation
    const formatSingleRelation = (relation: SingleRelationWithSource): SingleRelation | null => {
        if (query.text_sources[relation.text_source_id]?.disabled) return null;
        return {
            id1: relation.id1,
            id2: relation.id2,
            attribute: relation.attribute,
            comparator: relation.comparator
        };
    };

    // 格式化 TrendGroup
    const formatTrendGroup = (group: TrendGroupWithSource): TrendGroup | null => {
        return {
            ids: group.ids,
            duration_condition: formatScopeCondition(group.duration_condition)
        };
    };

    // 格式化 GroupRelation
    const formatGroupRelation = (relation: GroupRelationWithSource): GroupRelation | null => {
        if (query.text_sources[relation.text_source_id]?.disabled) return null;
        return {
            group1: relation.group1,
            group2: relation.group2,
            attribute: relation.attribute,
            comparator: relation.comparator
        };
    };

    const filteredTargets = query.targets
        .filter(target => !query.text_sources[target.text_source_id]?.disabled)
        .map(target => target.target);

    // 过滤掉禁用的趋势
    const filteredTrends = query.trends.map(formatTrend);

    // 过滤掉禁用的单趋势关系
    const filteredSingleRelations = (query.single_relations || [])
        .map(formatSingleRelation)
        .filter((relation): relation is SingleRelation => relation !== null);

    // 过滤掉禁用的趋势组合
    const filteredTrendGroups = (query.trend_groups || [])
        .map(formatTrendGroup)
        .filter((group): group is TrendGroup => group !== null);

    // 过滤掉禁用的组合关系
    const filteredGroupRelations = (query.group_relations || [])
        .map(formatGroupRelation)
        .filter((relation): relation is GroupRelation => relation !== null);

    return {
        targets: filteredTargets,
        trends: filteredTrends,
        single_relations: filteredSingleRelations,
        trend_groups: filteredTrendGroups,
        group_relations: filteredGroupRelations,
        duration_condition: formatScopeCondition(query.duration_condition),
        time_scope_condition: formatScopeCondition(query.time_scope_condition),
        max_value_scope_condition: formatScopeCondition(query.max_value_scope_condition),
        min_value_scope_condition: formatScopeCondition(query.min_value_scope_condition),
        comparator_between_start_end_value: query.comparator_between_start_end_value?.comparator,
    };
}