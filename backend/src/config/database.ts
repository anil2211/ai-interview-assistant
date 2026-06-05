import mongoose from 'mongoose';
import { config, isDevelopment, isTest } from './env';
import { logger } from '../middleware/logger';
import User from '../models/User';
import Question from '../models/Question';

interface DbOptions {
  maxRetries: number;
  retryDelay: number;
  retryDelayMultiplier: number;
}

const defaultOptions: DbOptions = {
  maxRetries: 5,
  retryDelay: 1000,
  retryDelayMultiplier: 2,
};

class Database {
  private static instance: Database;
  private retryCount = 0;
  private options: DbOptions;
  private isConnected = false;

  private constructor(options: Partial<DbOptions> = {}) {
    this.options = { ...defaultOptions, ...options };
  }

  static getInstance(options?: Partial<DbOptions>): Database {
    if (!Database.instance) {
      Database.instance = new Database(options);
    }
    return Database.instance;
  }

  private async seed(): Promise<void> {
    try {
      const adminExists = await User.findOne({ role: 'admin' });
      if (adminExists) {
        logger.info('Seed data already exists, skipping');
        return;
      }

      logger.info('Seeding database with initial data...');

      const admin = await User.create({
        username: 'admin',
        email: 'admin@interviewassistant.com',
        password: 'Admin123!',
        role: 'admin',
        profile: {
          avatar: '',
          bio: 'System administrator',
          experienceLevel: 'senior',
          targetRoles: ['Architect', 'Tech Lead'],
          techStack: ['JavaScript', 'TypeScript', 'Node.js', 'React', 'Docker', 'Kubernetes', 'AWS', 'MongoDB'],
        },
        preferences: {
          theme: 'dark',
          language: 'en',
          emailNotifications: false,
        },
      });

      await Question.create([
        {
          category: 'coding', subcategory: 'algorithms', difficulty: 'intermediate',
          title: 'Two Sum Problem',
          description: 'Find two numbers in an array that add up to a target sum.',
          content: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.',
          modelAnswer: 'Use a hash map to store visited numbers. For each number, check if target - number exists in the map. Time: O(n), Space: O(n).',
          hints: ['What data structure gives O(1) lookups?', 'Can you solve it in one pass?'],
          tags: ['arrays', 'hash-map', 'algorithms'],
          expectedTopics: ['hash tables', 'time complexity', 'space complexity'],
          timeLimit: 600, isActive: true, createdBy: admin._id,
        },
        {
          category: 'coding', subcategory: 'data-structures', difficulty: 'advanced',
          title: 'LRU Cache Implementation',
          description: 'Design and implement an LRU (Least Recently Used) cache.',
          content: 'Implement the LRUCache class with get(key) and put(key, value) operations in O(1) average time complexity. When the cache reaches capacity, it should evict the least recently used item.',
          modelAnswer: 'Use a doubly linked list with a hash map. The list maintains order of usage, the map provides O(1) access. Move accessed nodes to head, evict from tail.',
          hints: ['Consider using a doubly linked list', 'Map key to node for O(1) access'],
          tags: ['design', 'cache', 'linked-list', 'hash-map'],
          expectedTopics: ['doubly linked list', 'hash map', 'cache eviction policies'],
          timeLimit: 900, isActive: true, createdBy: admin._id,
        },
        {
          category: 'coding', subcategory: 'strings', difficulty: 'beginner',
          title: 'Valid Palindrome',
          description: 'Check if a string is a valid palindrome considering only alphanumeric characters.',
          content: 'Given a string s, return true if it is a palindrome, or false otherwise. Consider only alphanumeric characters and ignore case sensitivity.',
          modelAnswer: 'Use two pointers, one from start and one from end. Skip non-alphanumeric characters and compare case-insensitively.',
          hints: ['Try using two pointers', 'What characters should you skip?'],
          tags: ['strings', 'two-pointers', 'palindrome'],
          expectedTopics: ['string manipulation', 'two pointer technique'],
          timeLimit: 300, isActive: true, createdBy: admin._id,
        },
        {
          category: 'coding', subcategory: 'dynamic-programming', difficulty: 'advanced',
          title: 'Longest Common Subsequence',
          description: 'Find the length of the longest common subsequence between two strings.',
          content: 'Given two strings text1 and text2, return the length of their longest common subsequence. If there is no common subsequence, return 0.',
          modelAnswer: 'Use dynamic programming with a 2D table dp[i][j] representing LCS of prefixes. If characters match, dp[i][j] = 1 + dp[i-1][j-1]; else dp[i][j] = max(dp[i-1][j], dp[i][j-1]).',
          hints: ['Think about optimal substructure', 'A 2D DP table can help'],
          tags: ['dynamic-programming', 'strings', 'algorithms'],
          expectedTopics: ['dynamic programming', 'tabulation', 'memoization'],
          timeLimit: 900, isActive: true, createdBy: admin._id,
        },
        {
          category: 'devops', subcategory: 'ci-cd', difficulty: 'intermediate',
          title: 'CI/CD Pipeline Design',
          description: 'Design a CI/CD pipeline for a microservices architecture.',
          content: 'You need to design a CI/CD pipeline for a project with 10 microservices. Each service has its own repository. Describe the pipeline stages, tools, and deployment strategy you would use.',
          modelAnswer: 'Use GitHub Actions/Jenkins with stages: lint, test, build Docker image, push to registry, deploy to staging, run integration tests, promote to production with blue-green deployment.',
          hints: ['Consider containerization', 'How would you handle rollbacks?'],
          tags: ['ci-cd', 'devops', 'automation', 'docker'],
          expectedTopics: ['CI/CD pipelines', 'Docker', 'Kubernetes', 'blue-green deployment'],
          timeLimit: 600, isActive: true, createdBy: admin._id,
        },
        {
          category: 'devops', subcategory: 'infrastructure', difficulty: 'advanced',
          title: 'Kubernetes Cluster Architecture',
          description: 'Design a production-grade Kubernetes cluster for a high-traffic application.',
          content: 'Design a Kubernetes cluster architecture for an application serving 1M+ daily active users. Cover node types, networking, storage, security, and monitoring considerations.',
          modelAnswer: 'Use EKS/AKS/GKE with node pools (system + application), cluster autoscaler, HPA, service mesh (Istio), network policies, RBAC, PodSecurityPolicies, Prometheus/Grafana monitoring, and EFK/ELK for logging.',
          hints: ['Consider separating system and application workloads', 'Think about observability'],
          tags: ['kubernetes', 'architecture', 'devops', 'cloud'],
          expectedTopics: ['Kubernetes', 'service mesh', 'monitoring', 'security'],
          timeLimit: 900, isActive: true, createdBy: admin._id,
        },
        {
          category: 'devops', subcategory: 'monitoring', difficulty: 'beginner',
          title: 'Application Monitoring Strategy',
          description: 'Define a monitoring strategy for a web application.',
          content: 'What metrics, logs, and traces would you collect for a web application? How would you set up alerting and dashboards?',
          modelAnswer: 'Use the three pillars of observability: metrics (RED method: Rate, Errors, Duration), logs (structured JSON), traces (distributed tracing). Prometheus + Grafana for metrics, ELK for logs, Jaeger for traces.',
          hints: ['Think about the USE and RED methods', 'What tools would you use?'],
          tags: ['monitoring', 'observability', 'devops'],
          expectedTopics: ['Prometheus', 'Grafana', 'logging', 'distributed tracing'],
          timeLimit: 600, isActive: true, createdBy: admin._id,
        },
        {
          category: 'devops', subcategory: 'containers', difficulty: 'intermediate',
          title: 'Docker Multi-stage Builds',
          description: 'Optimize Docker images using multi-stage builds.',
          content: 'You have a Node.js application with TypeScript. Create an optimized Dockerfile using multi-stage builds. Explain the benefits and best practices.',
          modelAnswer: 'Use builder stage with devDependencies to compile, then production stage with only runtime deps. Use alpine images, run as non-root, add HEALTHCHECK, use .dockerignore.',
          hints: ['How can you reduce final image size?', 'What about security?'],
          tags: ['docker', 'containers', 'devops'],
          expectedTopics: ['Docker', 'multi-stage builds', 'container security'],
          timeLimit: 600, isActive: true, createdBy: admin._id,
        },
        {
          category: 'cloud', subcategory: 'aws', difficulty: 'advanced',
          title: 'AWS Serverless Architecture',
          description: 'Design a serverless architecture using AWS services.',
          content: 'Design a serverless architecture for a video processing application. Users upload videos, which are transcoded, analyzed, and made available for streaming. Consider cost, scalability, and fault tolerance.',
          modelAnswer: 'Use S3 for uploads triggering Lambda, SQS for queueing, Step Functions for workflow, MediaConvert for transcoding, DynamoDB for metadata, CloudFront for CDN, CloudWatch for monitoring.',
          hints: ['Think about event-driven architecture', 'How would you handle large files?'],
          tags: ['aws', 'serverless', 'cloud', 'architecture'],
          expectedTopics: ['AWS Lambda', 'S3', 'Step Functions', 'CloudFront'],
          timeLimit: 900, isActive: true, createdBy: admin._id,
        },
        {
          category: 'cloud', subcategory: 'azure', difficulty: 'intermediate',
          title: 'Azure Active Directory Integration',
          description: 'Integrate Azure AD for authentication in a web application.',
          content: 'Describe how to integrate Azure Active Directory for user authentication in a Node.js web application. Include OAuth2 flow, token validation, and role-based access control.',
          modelAnswer: 'Register app in Azure AD, use MSAL library, implement OAuth2 authorization code flow with PKCE, validate JWT tokens using JWKS endpoint, map Azure AD groups to application roles.',
          hints: ['What OAuth2 flow is best for web apps?', 'How do you validate tokens?'],
          tags: ['azure', 'authentication', 'cloud', 'security'],
          expectedTopics: ['Azure AD', 'OAuth2', 'JWT', 'RBAC'],
          timeLimit: 600, isActive: true, createdBy: admin._id,
        },
        {
          category: 'cloud', subcategory: 'gcp', difficulty: 'beginner',
          title: 'Google Cloud Storage Best Practices',
          description: 'Explain GCS best practices for storing and serving static assets.',
          content: 'Your application needs to store and serve user-uploaded images and documents. Describe how to use Google Cloud Storage effectively, including bucket configuration, access control, and CDN integration.',
          modelAnswer: 'Use object versioning, lifecycle policies for archiving, IAM for access control, signed URLs for temporary access, Cloud CDN or CloudFront for caching, CORS configuration for web clients.',
          hints: ['How would you handle access control?', 'What about cost optimization?'],
          tags: ['gcp', 'cloud-storage', 'cloud'],
          expectedTopics: ['GCS', 'IAM', 'CDN', 'signed URLs'],
          timeLimit: 600, isActive: true, createdBy: admin._id,
        },
        {
          category: 'cloud', subcategory: 'multi-cloud', difficulty: 'advanced',
          title: 'Multi-Cloud Disaster Recovery',
          description: 'Design a multi-cloud disaster recovery strategy.',
          content: 'Design a disaster recovery strategy that spans AWS and GCP for a critical financial application. Cover data replication, failover, DNS management, and compliance requirements.',
          modelAnswer: 'Use active-passive setup with Route53/Cloud DNS for failover, cross-region DB replication, S3/GCS replication for assets, infrastructure-as-code for quick provisioning, regular DR drills, RTO < 1 hour, RPO < 5 minutes.',
          hints: ['Think about data consistency', 'How do you handle DNS failover?'],
          tags: ['multi-cloud', 'disaster-recovery', 'cloud', 'architecture'],
          expectedTopics: ['DR strategies', 'DNS failover', 'data replication'],
          timeLimit: 900, isActive: true, createdBy: admin._id,
        },
        {
          category: 'system-design', subcategory: 'scalability', difficulty: 'advanced',
          title: 'Design a URL Shortener',
          description: 'Design a scalable URL shortening service like TinyURL.',
          content: 'Design a URL shortening service that handles 100M+ URLs and 1B+ redirects per month. Cover the API design, database schema, key generation, caching strategy, and scaling approach.',
          modelAnswer: 'Use a unique ID generator (snowflake or Redis incr), base62 encoding for short URLs, cache frequently accessed URLs with Redis, use consistent hashing for DB sharding, CDN for redirects, rate limiting for creation.',
          hints: ['How do you generate unique short codes?', 'How do you handle high read throughput?'],
          tags: ['system-design', 'scalability', 'caching'],
          expectedTopics: ['consistent hashing', 'caching', 'database sharding', 'CDN'],
          timeLimit: 900, isActive: true, createdBy: admin._id,
        },
        {
          category: 'system-design', subcategory: 'real-time', difficulty: 'intermediate',
          title: 'Design a Real-Time Chat System',
          description: 'Design a real-time chat application supporting millions of users.',
          content: 'Design a real-time messaging system that supports 10M users, group chats, typing indicators, read receipts, and message history. Consider the protocol, storage, and delivery guarantees.',
          modelAnswer: 'Use WebSocket for real-time communication, Kafka/RabbitMQ for message queuing, Cassandra for message storage (write-optimized), Redis for presence and typing indicators, Nginx for WebSocket load balancing.',
          hints: ['How do you ensure message ordering?', 'What about offline messages?'],
          tags: ['system-design', 'real-time', 'websocket', 'messaging'],
          expectedTopics: ['WebSockets', 'message queues', 'eventual consistency', 'CQRS'],
          timeLimit: 900, isActive: true, createdBy: admin._id,
        },
        {
          category: 'system-design', subcategory: 'database', difficulty: 'beginner',
          title: 'Database Design for an E-Commerce Platform',
          description: 'Design the database schema for an e-commerce platform.',
          content: 'Design the database schema for an e-commerce platform with users, products, orders, payments, and reviews. Consider the relationships, indexing strategy, and choice between SQL and NoSQL.',
          modelAnswer: 'Use PostgreSQL for transactional data (users, orders, payments) with proper indexing, Elasticsearch for product search, Redis for cart and session management. Use normalized schema with strategic denormalization for read performance.',
          hints: ['Which parts need ACID?', 'What read patterns do you need to optimize?'],
          tags: ['system-design', 'database', 'ecommerce', 'sql'],
          expectedTopics: ['database design', 'normalization', 'indexing', 'SQL vs NoSQL'],
          timeLimit: 600, isActive: true, createdBy: admin._id,
        },
        {
          category: 'system-design', subcategory: 'distributed-systems', difficulty: 'advanced',
          title: 'Design a Distributed Task Scheduler',
          description: 'Design a distributed cron job scheduler.',
          content: 'Design a distributed task scheduler that can handle millions of scheduled tasks across multiple timezones with failure handling, retries, and exactly-once execution semantics.',
          modelAnswer: 'Use a distributed lock (ZooKeeper/etcd) for leader election, store tasks in partitioned DB, use consistent hashing for task distribution, implement retry with exponential backoff, use a work queue (Kafka) for task execution.',
          hints: ['How do you prevent duplicate execution?', 'How do you handle node failures?'],
          tags: ['system-design', 'distributed-systems', 'scheduling'],
          expectedTopics: ['distributed locks', 'leader election', 'partitioning', 'retry strategies'],
          timeLimit: 900, isActive: true, createdBy: admin._id,
        },
        {
          category: 'behavioral', subcategory: 'leadership', difficulty: 'intermediate',
          title: 'Leading a Difficult Project',
          description: 'Describe a time you led a challenging project.',
          content: 'Tell me about a time you led a project that faced significant challenges. How did you motivate the team, handle setbacks, and ensure delivery?',
          modelAnswer: 'Use the STAR method: Situation (tight deadline, unclear requirements), Task (deliver MVP in 3 months), Action (organized daily standups, removed blockers, prioritized features), Result (delivered on time, team morale high).',
          hints: ['Use the STAR method', 'Focus on your specific contributions'],
          tags: ['leadership', 'behavioral', 'management'],
          expectedTopics: ['leadership', 'project management', 'team motivation'],
          timeLimit: 600, isActive: true, createdBy: admin._id,
        },
        {
          category: 'behavioral', subcategory: 'conflict-resolution', difficulty: 'intermediate',
          title: 'Resolving Technical Disagreement',
          description: 'How do you handle technical disagreements with team members?',
          content: 'Describe a situation where you had a technical disagreement with a colleague. How did you resolve it and what was the outcome?',
          modelAnswer: 'Focus on data-driven decisions, set up a meeting to present both approaches with pros/cons, consider running an experiment/SPIKE to validate assumptions, involve a senior engineer if needed, document decision and rationale.',
          hints: ['How do you keep it objective?', 'What if you disagree with your manager?'],
          tags: ['conflict-resolution', 'behavioral', 'communication'],
          expectedTopics: ['conflict resolution', 'communication', 'collaboration'],
          timeLimit: 600, isActive: true, createdBy: admin._id,
        },
        {
          category: 'behavioral', subcategory: 'failure', difficulty: 'beginner',
          title: 'Learning from Failure',
          description: 'Describe a mistake you made and what you learned from it.',
          content: 'Tell me about a time you made a mistake at work. What happened, how did you handle it, and what did you learn?',
          modelAnswer: 'Honesty is key. Example: Deployed without sufficient testing, caused a production outage. Immediately rolled back, fixed the issue, added automated tests, implemented deployment gates, shared learnings with team in post-mortem.',
          hints: ['Be honest about the mistake', 'Focus on the learning and improvements'],
          tags: ['failure', 'behavioral', 'growth'],
          expectedTopics: ['accountability', 'learning from mistakes', 'improvement'],
          timeLimit: 600, isActive: true, createdBy: admin._id,
        },
        {
          category: 'behavioral', subcategory: 'teamwork', difficulty: 'intermediate',
          title: 'Working in a Cross-Functional Team',
          description: 'How do you collaborate with non-technical stakeholders?',
          content: 'Describe your experience working with product managers, designers, and other non-technical stakeholders. How do you ensure effective communication and alignment?',
          modelAnswer: 'Regular sync meetings, translate technical concepts into business value, use visual aids (diagrams, prototypes), set clear expectations about timelines and trade-offs, provide regular status updates, ask clarifying questions early.',
          hints: ['How do you translate technical concepts?', 'What tools help collaboration?'],
          tags: ['teamwork', 'behavioral', 'communication'],
          expectedTopics: ['cross-functional collaboration', 'communication', 'stakeholder management'],
          timeLimit: 600, isActive: true, createdBy: admin._id,
        },
      ]);

      logger.info('Database seeded successfully: 1 admin user, 20 sample questions');
    } catch (error) {
      logger.error('Failed to seed database:', error);
    }
  }

  async connect(): Promise<void> {
    if (this.isConnected) {
      logger.info('MongoDB already connected');
      return;
    }

    try {
      const connectionOptions: mongoose.ConnectOptions = {
        serverSelectionTimeoutMS: 5000,
        heartbeatFrequencyMS: 10000,
        socketTimeoutMS: 45000,
        family: 4,
        maxPoolSize: 10,
        minPoolSize: 2,
      };

      if (isTest) {
        connectionOptions.maxPoolSize = 1;
        connectionOptions.minPoolSize = 1;
      }

      mongoose.connection.on('connected', () => {
        logger.info('MongoDB connected successfully');
        this.isConnected = true;
        this.retryCount = 0;
        if (isDevelopment && !isTest) {
          this.seed();
        }
      });

      mongoose.connection.on('error', (err) => {
        logger.error('MongoDB connection error:', err);
        this.isConnected = false;
      });

      mongoose.connection.on('disconnected', () => {
        logger.warn('MongoDB disconnected');
        this.isConnected = false;
        if (!isTest) {
          this.scheduleReconnect();
        }
      });

      mongoose.connection.on('reconnected', () => {
        logger.info('MongoDB reconnected');
        this.isConnected = true;
      });

      await mongoose.connect(config.mongodbUri, connectionOptions);
    } catch (error) {
      logger.error('MongoDB initial connection failed:', error);
      this.isConnected = false;
      this.retryCount++;

      if (this.retryCount < this.options.maxRetries) {
        await this.delay();
        await this.connect();
      } else {
        if (isDevelopment) {
          logger.warn('Max MongoDB retries reached. Running without database.');
        } else {
          throw new Error(`Failed to connect to MongoDB after ${this.options.maxRetries} retries`);
        }
      }
    }
  }

  private async scheduleReconnect(): Promise<void> {
    if (this.retryCount >= this.options.maxRetries) return;

    await this.delay();
    this.retryCount++;
    logger.info(`Attempting MongoDB reconnection (${this.retryCount}/${this.options.maxRetries})`);

    try {
      await mongoose.connect(config.mongodbUri);
    } catch (error) {
      logger.error('MongoDB reconnection failed:', error);
      this.scheduleReconnect();
    }
  }

  private delay(): Promise<void> {
    const delayMs = this.options.retryDelay * Math.pow(this.options.retryDelayMultiplier, this.retryCount);
    return new Promise(resolve => setTimeout(resolve, Math.min(delayMs, 30000)));
  }

  async disconnect(): Promise<void> {
    if (!this.isConnected) return;
    try {
      await mongoose.disconnect();
      this.isConnected = false;
      logger.info('MongoDB disconnected successfully');
    } catch (error) {
      logger.error('Error disconnecting MongoDB:', error);
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      if (!mongoose.connection.db) return false;
      await mongoose.connection.db.admin().ping();
      return true;
    } catch {
      return false;
    }
  }

  getConnection(): typeof mongoose {
    return mongoose;
  }
}

export const database = Database.getInstance();
export default database;
