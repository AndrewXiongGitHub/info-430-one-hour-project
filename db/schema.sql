IF OBJECT_ID(N'dbo.positions', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.positions (
        position_id INT IDENTITY(1,1) NOT NULL,
        name NVARCHAR(40) NOT NULL,
        CONSTRAINT PK_positions PRIMARY KEY (position_id),
        CONSTRAINT UQ_positions_name UNIQUE (name)
    );
END;

IF OBJECT_ID(N'dbo.squads', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.squads (
        squad_id INT IDENTITY(1,1) NOT NULL,
        name NVARCHAR(40) NOT NULL,
        CONSTRAINT PK_squads PRIMARY KEY (squad_id),
        CONSTRAINT UQ_squads_name UNIQUE (name)
    );
END;

IF OBJECT_ID(N'dbo.players', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.players (
        player_id INT IDENTITY(1,1) NOT NULL,
        first_name NVARCHAR(50) NOT NULL,
        last_name NVARCHAR(50) NOT NULL,
        age TINYINT NOT NULL,
        nationality NVARCHAR(50) NOT NULL,
        position_id INT NOT NULL,
        squad_id INT NOT NULL,
        CONSTRAINT PK_players PRIMARY KEY (player_id),
        CONSTRAINT UQ_players_name UNIQUE (first_name, last_name),
        CONSTRAINT CK_players_age CHECK (age BETWEEN 14 AND 20),
        CONSTRAINT FK_players_positions FOREIGN KEY (position_id)
            REFERENCES dbo.positions (position_id),
        CONSTRAINT FK_players_squads FOREIGN KEY (squad_id)
            REFERENCES dbo.squads (squad_id)
    );
END;

IF OBJECT_ID(N'dbo.player_reports', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.player_reports (
        report_id INT IDENTITY(1,1) NOT NULL,
        player_id INT NOT NULL,
        strength NVARCHAR(140) NOT NULL,
        development_focus NVARCHAR(140) NOT NULL,
        watch_for NVARCHAR(180) NOT NULL,
        CONSTRAINT PK_player_reports PRIMARY KEY (report_id),
        CONSTRAINT UQ_player_reports_player_id UNIQUE (player_id),
        CONSTRAINT FK_player_reports_players FOREIGN KEY (player_id)
            REFERENCES dbo.players (player_id)
    );
END;
