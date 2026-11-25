require("dotenv").config();

const fs = require("node:fs");
const path = require("node:path");
const sql = require("mssql");

const databaseName = process.env.DB_NAME || "";
if (!/^[A-Za-z][A-Za-z0-9_]*_myapp$/.test(databaseName)) {
  console.error("Set DB_NAME in .env to your own database name, such as jdoe_myapp.");
  process.exit(1);
}

const connectionConfig = {
  server: process.env.DB_SERVER,
  port: Number(process.env.DB_PORT || 1433),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: databaseName,
  options: { encrypt: true, trustServerCertificate: true }
};

const schema = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");

const players = [
  {
    firstName: "Marc", lastName: "Vidal", age: 17, position: "Central midfielder", nationality: "Spanish", squad: "Juvenil A",
    strength: "Scans early and finds forward passing lanes", developmentFocus: "Build strength in shoulder-to-shoulder duels", watchFor: "How quickly he turns pressure into a forward pass"
  },
  {
    firstName: "Leo", lastName: "Costa", age: 16, position: "Winger", nationality: "Portuguese", squad: "Juvenil B",
    strength: "Changes direction quickly in one-on-one play", developmentFocus: "Choose the right moment to release the ball", watchFor: "His first touch when attacking the space behind"
  },
  {
    firstName: "Nico", lastName: "Alvarez", age: 18, position: "Centre-back", nationality: "Argentine", squad: "Juvenil A",
    strength: "Calm distribution from the defensive line", developmentFocus: "Improve recovery speed against quick forwards", watchFor: "Whether he can break a press with a line-splitting pass"
  },
  {
    firstName: "Pau", lastName: "Ferrer", age: 15, position: "Goalkeeper", nationality: "Spanish", squad: "Cadet A",
    strength: "Confident handling and quick reactions", developmentFocus: "Be more decisive when claiming crosses", watchFor: "His starting position when the defense is pushed high"
  },
  {
    firstName: "Iker", lastName: "Soler", age: 17, position: "Right-back", nationality: "Spanish", squad: "Juvenil B",
    strength: "Times overlapping runs well", developmentFocus: "Stay balanced when defending isolated attackers", watchFor: "How he combines with the right winger in buildup"
  },
  {
    firstName: "Arnau", lastName: "Roca", age: 16, position: "Defensive midfielder", nationality: "Spanish", squad: "Juvenil B",
    strength: "Protects the ball well in crowded areas", developmentFocus: "Increase range and speed of longer passes", watchFor: "His awareness of runners behind the midfield"
  },
  {
    firstName: "Biel", lastName: "Navarro", age: 18, position: "Striker", nationality: "Spanish", squad: "Juvenil A",
    strength: "Finds space between defenders in the box", developmentFocus: "Link play more consistently with midfielders", watchFor: "His movement after laying the ball off"
  },
  {
    firstName: "Gael", lastName: "Romero", age: 15, position: "Left winger", nationality: "French", squad: "Cadet A",
    strength: "Drives at defenders with either foot", developmentFocus: "Add consistency to his final delivery", watchFor: "Whether he varies his runs by cutting inside or going wide"
  },
  {
    firstName: "Jan", lastName: "Puig", age: 17, position: "Attacking midfielder", nationality: "Spanish", squad: "Juvenil A",
    strength: "Creates chances with disguised through balls", developmentFocus: "Contribute more when the team loses possession", watchFor: "His decision-making in the space just outside the box"
  },
  {
    firstName: "Marti", lastName: "Serra", age: 16, position: "Left-back", nationality: "Spanish", squad: "Juvenil B",
    strength: "Keeps possession under pressure on the touchline", developmentFocus: "Improve delivery from wide areas", watchFor: "How early he recognizes a chance to join the attack"
  },
  {
    firstName: "Nil", lastName: "Campos", age: 18, position: "Central midfielder", nationality: "Spanish", squad: "Juvenil A",
    strength: "Maintains a high passing tempo", developmentFocus: "Make more runs beyond the forwards", watchFor: "His influence when the match becomes physically demanding"
  },
  {
    firstName: "Oriol", lastName: "Vega", age: 15, position: "Centre-back", nationality: "Spanish", squad: "Cadet A",
    strength: "Reads play early and steps into passing lanes", developmentFocus: "Improve aerial timing against taller opponents", watchFor: "How he starts attacks after winning the ball"
  },
  {
    firstName: "Pol", lastName: "Mendez", age: 17, position: "Right winger", nationality: "Spanish", squad: "Juvenil B",
    strength: "Accelerates quickly into open space", developmentFocus: "Improve composure when finishing at speed", watchFor: "His choices when a defender blocks the route to goal"
  },
  {
    firstName: "Eric", lastName: "Duarte", age: 16, position: "Goalkeeper", nationality: "Portuguese", squad: "Juvenil B",
    strength: "Comfortable playing short passes under pressure", developmentFocus: "Improve communication with the back line", watchFor: "His decisions when opponents press the goalkeeper"
  },
  {
    firstName: "Adria", lastName: "Molina", age: 18, position: "Defensive midfielder", nationality: "Spanish", squad: "Juvenil A",
    strength: "Protects central spaces and wins second balls", developmentFocus: "Look forward sooner after regaining possession", watchFor: "How often he connects defense to attack with one pass"
  },
  {
    firstName: "Bruno", lastName: "Torres", age: 15, position: "Striker", nationality: "Brazilian", squad: "Cadet A",
    strength: "Uses clever movement to separate from markers", developmentFocus: "Build strength when holding off defenders", watchFor: "His timing on runs across the near post"
  },
  {
    firstName: "Dario", lastName: "Costa", age: 17, position: "Centre-back", nationality: "Uruguayan", squad: "Juvenil B",
    strength: "Strong in direct challenges and stays composed", developmentFocus: "Develop a more reliable weaker-foot pass", watchFor: "His positioning when defending quick transitions"
  },
  {
    firstName: "Enzo", lastName: "Rivas", age: 16, position: "Central midfielder", nationality: "Mexican", squad: "Juvenil B",
    strength: "Finds pockets of space to receive between lines", developmentFocus: "Improve defensive tracking after forward runs", watchFor: "How he keeps possession when closely marked"
  },
  {
    firstName: "Hugo", lastName: "Serrano", age: 18, position: "Left winger", nationality: "Spanish", squad: "Juvenil A",
    strength: "Delivers accurate low crosses from the left", developmentFocus: "Add more variety to his one-on-one approach", watchFor: "His ability to create chances from a standing start"
  },
  {
    firstName: "Luca", lastName: "Marin", age: 15, position: "Attacking midfielder", nationality: "Italian", squad: "Cadet A",
    strength: "Shows close control and inventive combinations", developmentFocus: "Release the ball earlier when the lane closes", watchFor: "How he adapts when opponents mark him tightly"
  }
];

const positions = Array.from(new Set(players.map((player) => player.position)));
const squads = Array.from(new Set([
  ...players.map((player) => player.squad),
  "Barça Atlètic"
]));

async function createLookupIds(transaction, tableName, idColumn, names) {
  const ids = new Map();

  for (const name of names) {
    const result = await new sql.Request(transaction)
      .input("name", sql.NVarChar(40), name)
      .query(`
        IF NOT EXISTS (SELECT 1 FROM dbo.${tableName} WHERE name = @name)
        BEGIN
          INSERT INTO dbo.${tableName} (name) VALUES (@name);
        END;

        SELECT ${idColumn} AS id FROM dbo.${tableName} WHERE name = @name;
      `);

    if (!result.recordset[0]) {
      throw new Error(`Could not find or create ${tableName} value "${name}".`);
    }
    ids.set(name, result.recordset[0].id);
  }

  return ids;
}

async function loadDatabase() {
  let pool;
  let transaction;
  let transactionStarted = false;

  try {
    pool = await sql.connect(connectionConfig);
    await pool.request().batch(schema);

    transaction = new sql.Transaction(pool);
    await transaction.begin();
    transactionStarted = true;

    const positionIds = await createLookupIds(transaction, "positions", "position_id", positions);
    const squadIds = await createLookupIds(transaction, "squads", "squad_id", squads);

    for (const player of players) {
      const playerResult = await new sql.Request(transaction)
        .input("firstName", sql.NVarChar(50), player.firstName)
        .input("lastName", sql.NVarChar(50), player.lastName)
        .input("age", sql.TinyInt, player.age)
        .input("nationality", sql.NVarChar(50), player.nationality)
        .input("positionId", sql.Int, positionIds.get(player.position))
        .input("squadId", sql.Int, squadIds.get(player.squad))
        .query(`
          IF NOT EXISTS (
            SELECT 1 FROM dbo.players
            WHERE first_name = @firstName AND last_name = @lastName
          )
          BEGIN
            INSERT INTO dbo.players (first_name, last_name, age, nationality, position_id, squad_id)
            VALUES (@firstName, @lastName, @age, @nationality, @positionId, @squadId);
          END;

          SELECT player_id
          FROM dbo.players
          WHERE first_name = @firstName AND last_name = @lastName;
        `);

      const playerId = playerResult.recordset[0].player_id;
      await new sql.Request(transaction)
        .input("playerId", sql.Int, playerId)
        .input("strength", sql.NVarChar(140), player.strength)
        .input("developmentFocus", sql.NVarChar(140), player.developmentFocus)
        .input("watchFor", sql.NVarChar(180), player.watchFor)
        .query(`
          IF NOT EXISTS (
            SELECT 1 FROM dbo.player_reports WHERE player_id = @playerId
          )
          BEGIN
            INSERT INTO dbo.player_reports (player_id, strength, development_focus, watch_for)
            VALUES (@playerId, @strength, @developmentFocus, @watchFor);
          END;
        `);
    }

    await transaction.commit();
    transactionStarted = false;

    const counts = await pool.request().query(`
      SELECT
        (SELECT COUNT(*) FROM dbo.positions) AS positionCount,
        (SELECT COUNT(*) FROM dbo.squads) AS squadCount,
        (SELECT COUNT(*) FROM dbo.players) AS playerCount,
        (SELECT COUNT(*) FROM dbo.player_reports) AS reportCount;
    `);
    const { positionCount, squadCount, playerCount, reportCount } = counts.recordset[0];
    console.log(`Database ready: ${positionCount} positions, ${squadCount} squads, ${playerCount} players, and ${reportCount} player reports.`);
  } catch (error) {
    if (transactionStarted) {
      try {
        await transaction.rollback();
      } catch (rollbackError) {
        console.error("Database rollback failed:", rollbackError.message);
      }
    }

    console.error("Database load failed:", error.message);
    process.exitCode = 1;
  } finally {
    if (pool) {
      await pool.close();
    }
  }
}

loadDatabase();
