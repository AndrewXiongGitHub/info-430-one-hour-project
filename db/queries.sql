DECLARE @term NVARCHAR(100) = LTRIM(RTRIM(@searchTerm));

SELECT
    p.player_id AS id,
    CONCAT(p.first_name, N' ', p.last_name) AS name,
    p.age AS age,
    pos.name AS position,
    p.nationality AS nationality,
    s.name AS squad,
    r.strength AS strength,
    r.development_focus AS developmentFocus,
    r.watch_for AS watchFor
FROM dbo.players AS p
INNER JOIN dbo.positions AS pos
    ON pos.position_id = p.position_id
INNER JOIN dbo.squads AS s
    ON s.squad_id = p.squad_id
INNER JOIN dbo.player_reports AS r
    ON r.player_id = p.player_id
WHERE (
        @term = N''
        OR CHARINDEX(@term, CONCAT(p.first_name, N' ', p.last_name)) > 0
        OR CHARINDEX(@term, pos.name) > 0
        OR CHARINDEX(@term, p.nationality) > 0
    )
    AND (@squad = N'' OR s.name = @squad)
    AND (@minAge IS NULL OR p.age >= @minAge)
    AND (@maxAge IS NULL OR p.age <= @maxAge)
ORDER BY p.age DESC, p.last_name, p.first_name;
