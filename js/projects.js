/* ===================================================================
 * Milan Sherin Portfolio - Projects Data
 * Authentic project details extracted directly from source code & READMEs
 * =================================================================== */

const PROJECTS_DATA = [
  {
    id: "verba",
    category: "VISION AI / ACCESSIBILITY",
    title: "VERBA — Indian Sign Language AI",
    oneLineSummary: "Real-time bidirectional Indian Sign Language communication assistant streaming 270 landmark coordinates over WebSockets for counter environments.",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "VERBA Indian Sign Language Recognition Pipeline",
    overview: "Built for hospital receptions and bank counters as a communication assistant, not a detached translator. It bridges deaf and hearing interlocutors through a dual-channel flow: camera landmark detection to speech for Deaf individuals, and speech or text translated to ISL gloss order with demonstration clips for hearing staff. Built with strict privacy at its foundation so only landmark coordinates ever leave the browser—no raw video or audio is ever transmitted or stored.",
    problem: "Deaf citizens encounter constant friction at public service desks where hearing personnel lack sign language skills. Existing cloud computer vision models demand high bandwidth, incur latency that breaks natural dialogue, and introduce severe privacy risks by streaming raw video feeds of citizens to remote servers.",
    howItWorks: [
      {
        step: "01 / In-Browser Landmark Extraction",
        description: "The client camera stream is processed locally using MediaPipe WebAssembly. Only 270 normalized skeletal coordinates (42 3D hand joints across both hands plus upper-body pose joints) are extracted. Zero video frames leave the browser."
      },
      {
        step: "02 / Low-Latency WebSocket Streaming",
        description: "The 270-float coordinate vectors stream continuously across a persistent bi-directional WebSocket connection (/ws/session) to the FastAPI backend."
      },
      {
        step: "03 / Kinematic Feature Engineering",
        description: "A ring buffer maintains a 30-frame temporal window, extracting 1,322 kinematic statistics: 4 arm limbs, 40 finger limb vectors, velocities, accelerations, and body-relative locations normalized by shoulder width."
      },
      {
        step: "04 / ONNX MLP Inference & Idle Rejection",
        description: "A compact Multilayer Perceptron running in ONNX Runtime classifies the engineered window. An explicit NONE idle class and consecutive probability thresholds (p > 0.75 over 2 windows) eliminate false positives from resting hands or scratching."
      },
      {
        step: "05 / Candidate Confirmation & Reverse Channel",
        description: "Classified signs are displayed as candidate chips requiring signer confirmation before synthesis into speech. In reverse, hearing speech or text is translated into ISL gloss grammar and mapped to demonstration clips or fingerspelling."
      }
    ],
    keyFeatures: [
      "Zero-video transmission: only 270-float skeletal coordinates leave the client",
      "1,322 engineered kinematic window features fed into an ONNX Runtime MLP",
      "Explicit NONE idle rejection class preventing accidental gesture activations",
      "Candidate -> Confirm -> Speak safety flow preventing accidental vocalization",
      "Bidirectional WebSocket pipeline linking FastAPI backend with React/Capacitor",
      "Specialized scenario vocabularies tailored for hospital triage and bank counters"
    ],
    techStack: [
      "Python", "FastAPI", "MediaPipe WASM", "ONNX Runtime", "WebSockets", "React", "TypeScript", "Capacitor"
    ],
    challenges: "Training directly on video frames fails to generalize across signers and lighting; engineering invariant skeletal limb vectors and shoulder-normalized geometry was essential. Managing WebAssembly webcam lifecycles in React taught strict ref management to prevent stream startup deadlocks.",
    usage: {
      command: "./run.sh   # On Windows: run.bat -> http://localhost:8000",
      output: "[Uvicorn] Running on http://0.0.0.0:8000\n[Vebra] Session initialized (scenario: hospital)\n[Inference] Model loaded: backend/models/model.onnx (classes: 18)\n[WebSocket] Client connected: /ws/session?scenario=hospital\n[SignRecognizer] Candidate committed: EMERGENCY (confidence: 0.94)"
    },
    githubUrl: "https://github.com/Milan-6/PROJECT----Verba"
  },
  {
    id: "log-analyzer",
    category: "SYSTEMS TOOL / TELEMETRY",
    title: "CLI Log File Analyzer",
    oneLineSummary: "Automated server log parsing pipeline extracting incident frequencies, actor identities, and system health status into structured JSON.",
    image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Server Log Telemetry Analyzer",
    overview: "Built to eliminate manual log auditing during system triage. The utility ingests flat server log files, identifies activity patterns using regular expressions, tracks user sessions, and generates an audit-ready JSON health report.",
    problem: "Manually scanning high-throughput server logs during outages is slow and error-prone. Critical error-to-request ratios and warning context lines need fast automated aggregation to assess system degradation.",
    howItWorks: [
      {
        step: "01 / Log Ingestion",
        description: "Streams flat server log files into memory through standard file I/O operations (read_log_file())."
      },
      {
        step: "02 / Regex Token Extraction",
        description: "Executes targeted regular expressions to tally log levels (\\bERROR\\b, \\bWARN(:?ING)?\\b, \\bINFO\\b) and extracts metadata tokens: user_id[:=], username[:=], and request_id[:=]."
      },
      {
        step: "03 / System Health Evaluation",
        description: "Calculates total requests and evaluates error rate: (errors / total_requests) * 100. Classifies system state into Healthy (0 errors), Degraded (<5%), or Critical (>=5%)."
      },
      {
        step: "04 / Multiline Evidence Capture",
        description: "Applies multiline regex flags (^.*\\bWARNING\\b.*$) to capture full context strings for every warning event."
      },
      {
        step: "05 / JSON Report Serialization",
        description: "Serializes aggregated metrics, actor arrays, health ratings, and evidence lines into log_analyzed_result.json."
      }
    ],
    keyFeatures: [
      "Regex-driven activity extraction for ERROR, WARN, and INFO levels",
      "Actor tracking isolating unique user-ids, usernames, and request-ids",
      "Automated health status classification (Healthy, Degraded, Critical)",
      "Multiline regex evidence extractor capturing full warning context",
      "Formatted JSON serialization output ready for downstream telemetry"
    ],
    techStack: [
      "Python", "Regular Expressions (re)", "JSON", "CLI Scripting"
    ],
    challenges: "Handling varied logging conventions required supporting multiple key-value delimiters (both ':' and '='). Implementing multiline regex matching without catastrophic backtracking taught careful boundary anchoring and non-greedy captures.",
    usage: {
      command: "python log_analyzer.py",
      output: "{\n  \"activity_counter\": {\n    \"ERROR\": 12,\n    \"INFO\": 84,\n    \"WARN\": 4\n  },\n  \"health-result\": [{\n    \"total-request\": 100,\n    \"errors\": 12,\n    \"error-rate\": 12.0,\n    \"status\": \"Critical\",\n    \"warnings\": 4\n  }],\n  \"summary\": {\n    \"number of warnings\": 4,\n    \"evidence\": [\n      \"2026-09-02 14:22:01 WARNING High memory pressure on worker-3\"\n    ]\n  }\n}"
    },
    githubUrl: "https://github.com/Milan-6/LOG-FILE-ANALYZER"
  },
  {
    id: "automation-pipeline",
    category: "AUTOMATION / WORKFLOWS",
    title: "Multi-Service Automation Pipeline",
    oneLineSummary: "Automated content syndication and release orchestration engine built on n8n Community Edition.",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Event Automation Pipeline",
    overview: "An event-driven workflow engine deployed on self-hosted n8n Community Edition. It captures project releases, synthesizes technical highlights using Google Gemini, and distributes updates to professional networks without manual copying.",
    problem: "Manually formatting and cross-posting software release notes across platforms is repetitive and inconsistent. The pipeline automates the transformation of technical commits into structured release announcements.",
    howItWorks: [
      {
        step: "01 / Ingestion Trigger",
        description: "Monitors release feeds and webhooks on scheduled cron intervals or incoming HTTP triggers."
      },
      {
        step: "02 / AI Synthesis",
        description: "Passes raw changelogs to the Google Gemini API to extract key features into concise, professional copy."
      },
      {
        step: "03 / Multi-Channel Distribution",
        description: "Dispatches formatted payloads to the LinkedIn API and internal webhooks, logging execution telemetry."
      }
    ],
    keyFeatures: [
      "Event-driven workflow orchestration on self-hosted n8n Community",
      "LLM-assisted release summarization via Google Gemini REST API",
      "Automated publication to professional networks with retry policies",
      "Centralized execution monitoring and error notification webhooks"
    ],
    techStack: [
      "n8n Community", "Google Gemini API", "REST Webhooks", "LinkedIn API"
    ],
    challenges: "Managing authentication token lifecycles and rate-limiting constraints across third-party enterprise APIs required configuring robust retry strategies and conditional error routes.",
    usage: {
      command: "# Executed within self-hosted n8n instance\nn8n start --tunnel",
      output: "[n8n] Workflow 'Release-Syndication' triggered via Webhook\n[Gemini] Summary generated in 842ms\n[LinkedIn API] Post created: urn:li:share:72401829\n[Status] Execution completed successfully (Code: 200)"
    },
    githubUrl: "https://github.com/Milan-6"
  },
  {
    id: "finance-tracker",
    category: "DATA TOOL / SQLITE",
    title: "Personal Finance Tracker CLI",
    oneLineSummary: "Command-line financial ledger and monthly expenditure aggregator backed by SQLite.",
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Personal Finance Tracker CLI",
    overview: "A command-line ledger built with Python and SQLite to record personal income and expenditures. Built to bypass bloated web budgeting apps in favor of instantaneous, private, terminal-based bookkeeping.",
    problem: "Modern financial apps require cloud accounts, monthly fees, and third-party bank syncing for simple daily bookkeeping. A local CLI tool provides complete data privacy and zero network reliance.",
    howItWorks: [
      {
        step: "01 / CLI Parameter Parsing",
        description: "Accepts transaction data via argparse flags: --type (income or expense), --amount, --category, --date, and optional --report."
      },
      {
        step: "02 / SQLite Schema Initialization",
        description: "Connects to local tracker.db, executing CREATE TABLE IF NOT EXISTS finance_tracker with typed fields."
      },
      {
        step: "03 / Parameterized Transaction Insertion",
        description: "Constructs a Tracker object and executes parameterized INSERT queries to prevent SQL injection."
      },
      {
        step: "04 / Monthly Aggregate Reporting",
        description: "When --report is passed, executes pattern-matched queries (date LIKE ?) to sum income and expenses, computing net savings balance."
      }
    ],
    keyFeatures: [
      "Zero-dependency local persistence using native Python sqlite3",
      "Strict CLI argument validation via argparse with choices constraints",
      "Parameterized SQL execution guarding against query corruption",
      "Categorized transaction accounting for both credit and debit operations",
      "Monthly aggregation calculating total income, total expenditure, and net savings"
    ],
    techStack: [
      "Python", "SQLite3", "argparse", "SQL"
    ],
    challenges: "Structuring date-based filtering and aggregate sums directly in raw SQL without an ORM layer taught efficient query construction and database cursor lifecycle handling.",
    usage: {
      command: "# Record an expense\npython tracker.py --type expense --amount 500 --category food --date 2026-08-30\n\n# Generate monthly report\npython tracker.py --report 08",
      output: "DataBase updated\nTHE TOTAL INCOME       :25000.0\nTHE TOTAL EXPANSE      :500.0\nTHE SAVING IS          :24500.0"
    },
    githubUrl: "https://github.com/Milan-6/PROJECT-2---PERSONAL-FINANCE-TRACKER"
  },
  {
    id: "password-vault",
    category: "CRYPTOGRAPHY / SECURITY",
    title: "Cryptographic Password Vault CLI",
    oneLineSummary: "Encrypted command-line password manager securing credential records on disk using Fernet symmetric cryptography.",
    image: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Cryptographic Password Vault CLI",
    overview: "A lightweight terminal credential manager. It holds credential entries in memory during runtime and seals the repository file on disk with Fernet authenticated encryption (AES-128-CBC with HMAC-SHA256) when exited.",
    problem: "Developers frequently keep sensitive service credentials in plaintext files or spreadsheets. This utility provides encrypted local storage so disk snooping reveals only cryptographic ciphertext.",
    howItWorks: [
      {
        step: "01 / Key Verification & Generation",
        description: "Checks for an encryption key file. If missing, it generates a fresh authenticated Fernet key using Fernet.generate_key()."
      },
      {
        step: "02 / Vault Decryption & In-Memory Loading",
        description: "If vault_date.json exists, Crypto_handler decrypts the file using the local key and deserializes records into Entry objects."
      },
      {
        step: "03 / Interactive Terminal Session",
        description: "A terminal loop handles credential addition, username search, record listing, and stale credential removal."
      },
      {
        step: "04 / Serialization & Disk Encryption",
        description: "On exit, Vault serializes objects to JSON, and crypto.encrypt_data() re-encrypts the file with Fernet, locking it on disk."
      }
    ],
    keyFeatures: [
      "Authenticated symmetric encryption via Fernet (AES-128-CBC + HMAC-SHA256)",
      "Automated cryptographic key generation on initial deployment",
      "Modular design separating storage (Vault), encryption (Crypto_handler), and records (Entry)",
      "In-memory credential lifecycle with automatic re-encryption upon exit",
      "Password complexity checker validating numeric, alphabetic, and special character presence"
    ],
    techStack: [
      "Python", "cryptography (Fernet)", "JSON", "CLI Scripting"
    ],
    challenges: "Managing the state transition between plaintext in memory and ciphertext on disk: ensuring the file is never left unencrypted if the process exits cleanly. Highlighted the single-point-of-failure risk in local key storage.",
    usage: {
      command: "pip install cryptography\npython passwordvault.py",
      output: "=== Password Manager ===\n1. Add Entry\n2. Search Entry\n3. List All Entries\n4. Remove Entry\n5. Save & Exit\nEnter your choice (1-5): 2\nenter the username: admin\nUsername : admin \nsite : lab.internal \nPassword : [encrypted]\nsaving and securing vault::\nvault securely locked<<<<bye"
    },
    githubUrl: "https://github.com/Milan-6/PROJECT-4------PASSWORD-VALUT-CLI-"
  },
  {
    id: "network-asset-tracker",
    category: "SECOPS / ASSET MANAGEMENT",
    title: "Network Asset & Vulnerability Tracker",
    oneLineSummary: "Object-oriented network inventory validating IP boundaries, daemon endpoints, and CVSS vulnerability severities.",
    image: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Network Asset and Vulnerability Tracker",
    overview: "An object-oriented Python architecture designed to track network topology, running host services, and associated CVE vulnerabilities. Built to practice clean domain modeling with strict encapsulation and validation logic.",
    problem: "Network inventories easily drift into chaos without strict typing and boundary validation. Security teams need to track which machines host privileged daemons and rapidly calculate the maximum severity exposure of each host.",
    howItWorks: [
      {
        step: "01 / Base Asset & IP Validation",
        description: "The Asset base class validates IPv4/IPv6 addresses using Python's native ipaddress module, raising ValueError on invalid strings."
      },
      {
        step: "02 / Host & Vulnerability Composition",
        description: "Host inherits Asset, managing a set of Vulnerability objects with validated CVSS scores (0.0 to 10.0). Computes max_severity and len() dynamically."
      },
      {
        step: "03 / Service Daemon Endpoint Auditing",
        description: "Service inherits Asset, capturing port and protocol. Provides computed endpoint strings (IP:PORT/PROTO) and flags privileged daemons (port < 1024)."
      },
      {
        step: "04 / Collision-Resistant Inventory",
        description: "Inventory manages all registered assets in an internal lookup dictionary, rejecting duplicate asset IDs."
      }
    ],
    keyFeatures: [
      "Class inheritance hierarchy (Asset -> Host, Service) with property validation",
      "Native IP address verification using ipaddress guarding against invalid inputs",
      "Strict CVSS score boundary enforcement (0.0 to 10.0)",
      "Set-based vulnerability deduplication using custom __eq__ and __hash__ on CVE IDs",
      "Privileged port detection dynamically identifying services below port 1024",
      "Collision-resistant asset inventory catching duplicate identifiers"
    ],
    techStack: [
      "Python", "OOP", "ipaddress", "CVSS Domain Modeling"
    ],
    challenges: "Implementing custom hashing (__hash__ and __eq__) in Python classes so objects behave predictably inside native sets and dictionaries. Balancing validation assertions with clean exception handling taught defensive programming.",
    usage: {
      command: "python assetTracker.py",
      output: "Server Vulnerabilities: 2\nServer Max Severity: 10.0\nService Endpoint: 192.168.1.10:443/TCP\nIs Privileged Port: True\nValidation successful (caught expected error): Asset with ID 'HOST-01' already exists"
    },
    githubUrl: "https://github.com/Milan-6/PROJECT-3------NETWORK-ASSET-TRACKER"
  },
  {
    id: "weather-cli",
    category: "API TOOL / NETWORKING",
    title: "Weather & Air Quality CLI",
    oneLineSummary: "Lightweight terminal client querying OpenWeatherMap endpoints for instantaneous weather conditions and AQI ratings.",
    image: "https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Weather and Air Quality CLI",
    overview: "A command-line client built to check weather and air quality straight from the terminal. Queries OpenWeatherMap REST endpoints to deliver meteorological metrics and pollution indexes without opening a browser.",
    problem: "Modern weather websites are laden with advertisements, tracking scripts, and heavy payloads when all a developer needs is the current atmospheric condition and air safety index.",
    howItWorks: [
      {
        step: "01 / Geocoding Query",
        description: "Queries OpenWeatherMap's Current Weather endpoint to resolve the target city's geographical coordinates (latitude and longitude)."
      },
      {
        step: "02 / Meteorological Data Ingestion",
        description: "Retrieves current weather descriptions and temperature units for the resolved coordinate pair."
      },
      {
        step: "03 / Air Quality Query",
        description: "Queries the Air Pollution API (/data/2.5/air_pollution) using the coordinates to retrieve the numerical Air Quality Index (AQI)."
      },
      {
        step: "04 / Formatted Terminal Output",
        description: "Formats and displays the weather description and AQI rating in a clean columnar terminal layout."
      }
    ],
    keyFeatures: [
      "Multi-endpoint REST querying combining coordinate resolution, weather state, and air pollution indices",
      "Zero-browser terminal operation with fast HTTP request dispatching",
      "Graceful HTTP status code handling and error reporting",
      "Formatted text output displaying atmospheric conditions and air quality metrics"
    ],
    techStack: [
      "Python", "Requests", "OpenWeatherMap REST API", "JSON"
    ],
    challenges: "Handling multi-step API dependencies where coordinates from an initial query are required for subsequent pollution endpoint calls. Handling missing dictionary keys and optional response lists taught defensive JSON parsing.",
    usage: {
      command: "python Weather_app.py",
      output: "Enter the city: Kochi\nThe weather is    :    scattered clouds\nThe air quality is:                   2"
    },
    githubUrl: "https://github.com/Milan-6/PROJECT-1---WEATHER-CLI-APP"
  }
];
