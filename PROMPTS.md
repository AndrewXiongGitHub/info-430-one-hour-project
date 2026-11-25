# What I asked the AI

Keep a short log. One entry per prompt is enough.

| What I asked (paste or summarize) | What happened | What I had to fix or check |
| --- | --- | --- |
| Added a dropdown filter for academy squad and an age range filter next to the search box. Updated db/queries.sql to take a parameter for each and the /api route to pass them. | The agent added the squad dropdown and min/max age inputs, and the query now filters on all three values plus the text search. The page updated correctly after I restarted the server. | Checked that leaving every filter blank still returns all prospects. Fixed an issue where an empty age field was treated as 0 and returned no rows. Tested `' OR 1=1 --` in the search box and got no rows, so the values are bound parameters. |
| Added `positions` and `squads` tables, made `players` reference them with foreign keys, and updated schema.sql, load.js, and the query with JOINs. | The agent split squad and position into their own tables, updated the loader to insert them first, and rewrote the query to JOIN all three tables. The page showed the same results as before. | Re-ran `node db/load.js` and hit duplicate key errors, so I had the agent drop and recreate the tables at the start of the script. Compared a query run in VS Code with the page and confirmed the row counts matched. |