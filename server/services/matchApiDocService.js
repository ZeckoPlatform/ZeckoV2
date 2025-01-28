const fs = require('fs').promises;
const path = require('path');
const swaggerJsdoc = require('swagger-jsdoc');
const yaml = require('js-yaml');
const marked = require('marked');

class MatchApiDocService {
    constructor() {
        this.baseDir = path.join(__dirname, '../docs/api');
        this.swaggerOptions = {
            definition: {
                openapi: '3.0.0',
                info: {
                    title: 'Match API Documentation',
                    version: '1.0.0',
                    description: 'API documentation for the Match System'
                },
                servers: [
                    {
                        url: process.env.API_BASE_URL || 'http://localhost:3000',
                        description: 'API Server'
                    }
                ]
            },
            apis: ['./routes/*.js', './models/*.js']
        };
    }

    async generateApiDocs() {
        const [
            swaggerDocs,
            markdownDocs,
            examples,
            schemas
        ] = await Promise.all([
            this.generateSwaggerDocs(),
            this.generateMarkdownDocs(),
            this.loadApiExamples(),
            this.loadSchemas()
        ]);

        const documentation = {
            swagger: swaggerDocs,
            markdown: markdownDocs,
            examples,
            schemas,
            metadata: this.generateMetadata()
        };

        await this.saveDocumentation(documentation);
        return documentation;
    }

    async generateSwaggerDocs() {
        const specs = swaggerJsdoc(this.swaggerOptions);
        await fs.writeFile(
            path.join(this.baseDir, 'swagger.json'),
            JSON.stringify(specs, null, 2)
        );
        return specs;
    }

    async generateMarkdownDocs() {
        const docs = {};
        const sections = [
            'getting-started',
            'authentication',
            'endpoints',
            'models',
            'webhooks',
            'errors'
        ];

        for (const section of sections) {
            const content = await fs.readFile(
                path.join(this.baseDir, 'markdown', `${section}.md`),
                'utf8'
            );
            docs[section] = {
                content,
                html: marked(content)
            };
        }

        return docs;
    }

    async loadApiExamples() {
        const examples = {};
        const examplesDir = path.join(this.baseDir, 'examples');
        const files = await fs.readdir(examplesDir);

        for (const file of files) {
            if (file.endsWith('.json')) {
                const content = await fs.readFile(
                    path.join(examplesDir, file),
                    'utf8'
                );
                examples[file.replace('.json', '')] = JSON.parse(content);
            }
        }

        return examples;
    }

    async loadSchemas() {
        const schemas = {};
        const schemasDir = path.join(this.baseDir, 'schemas');
        const files = await fs.readdir(schemasDir);

        for (const file of files) {
            if (file.endsWith('.yaml')) {
                const content = await fs.readFile(
                    path.join(schemasDir, file),
                    'utf8'
                );
                schemas[file.replace('.yaml', '')] = yaml.load(content);
            }
        }

        return schemas;
    }

    generateMetadata() {
        return {
            generatedAt: new Date().toISOString(),
            version: '1.0.0',
            apiVersion: '1.0.0',
            lastUpdated: this.getLastUpdateDate()
        };
    }

    async getLastUpdateDate() {
        const stats = await fs.stat(path.join(this.baseDir, 'swagger.json'));
        return stats.mtime.toISOString();
    }

    async saveDocumentation(documentation) {
        await fs.writeFile(
            path.join(this.baseDir, 'documentation.json'),
            JSON.stringify(documentation, null, 2)
        );
    }

    async searchDocs(query) {
        const documentation = JSON.parse(
            await fs.readFile(
                path.join(this.baseDir, 'documentation.json'),
                'utf8'
            )
        );

        return {
            endpoints: this.searchEndpoints(documentation.swagger.paths, query),
            models: this.searchModels(documentation.swagger.components.schemas, query),
            markdown: this.searchMarkdown(documentation.markdown, query)
        };
    }

    searchEndpoints(paths, query) {
        const results = [];
        const searchTerm = query.toLowerCase();

        for (const [path, methods] of Object.entries(paths)) {
            for (const [method, details] of Object.entries(methods)) {
                if (
                    path.toLowerCase().includes(searchTerm) ||
                    details.summary?.toLowerCase().includes(searchTerm) ||
                    details.description?.toLowerCase().includes(searchTerm)
                ) {
                    results.push({
                        path,
                        method,
                        summary: details.summary,
                        description: details.description
                    });
                }
            }
        }

        return results;
    }

    searchModels(schemas, query) {
        const results = [];
        const searchTerm = query.toLowerCase();

        for (const [name, schema] of Object.entries(schemas)) {
            if (
                name.toLowerCase().includes(searchTerm) ||
                schema.description?.toLowerCase().includes(searchTerm)
            ) {
                results.push({
                    name,
                    description: schema.description,
                    type: schema.type
                });
            }
        }

        return results;
    }

    searchMarkdown(markdown, query) {
        const results = [];
        const searchTerm = query.toLowerCase();

        for (const [section, content] of Object.entries(markdown)) {
            if (content.content.toLowerCase().includes(searchTerm)) {
                results.push({
                    section,
                    matches: this.findMarkdownMatches(content.content, searchTerm)
                });
            }
        }

        return results;
    }

    findMarkdownMatches(content, searchTerm) {
        const matches = [];
        const lines = content.split('\n');
        
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].toLowerCase().includes(searchTerm)) {
                matches.push({
                    line: i + 1,
                    content: lines[i].trim(),
                    context: this.getLineContext(lines, i)
                });
            }
        }

        return matches;
    }

    getLineContext(lines, lineIndex, contextSize = 2) {
        const start = Math.max(0, lineIndex - contextSize);
        const end = Math.min(lines.length, lineIndex + contextSize + 1);
        
        return lines.slice(start, end).map((line, index) => ({
            line: start + index + 1,
            content: line.trim(),
            isFocus: index === lineIndex - start
        }));
    }

    async generatePostmanCollection() {
        const documentation = JSON.parse(
            await fs.readFile(
                path.join(this.baseDir, 'documentation.json'),
                'utf8'
            )
        );

        const collection = {
            info: {
                name: 'Match API Collection',
                description: 'Postman collection for the Match API',
                schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
            },
            item: this.convertSwaggerToPostman(documentation.swagger)
        };

        await fs.writeFile(
            path.join(this.baseDir, 'postman-collection.json'),
            JSON.stringify(collection, null, 2)
        );

        return collection;
    }

    convertSwaggerToPostman(swagger) {
        const items = [];

        for (const [path, methods] of Object.entries(swagger.paths)) {
            for (const [method, details] of Object.entries(methods)) {
                items.push({
                    name: details.summary || path,
                    request: {
                        method: method.toUpperCase(),
                        header: this.generatePostmanHeaders(details),
                        url: {
                            raw: `{{baseUrl}}${path}`,
                            host: ['{{baseUrl}}'],
                            path: path.split('/').filter(Boolean)
                        },
                        description: details.description,
                        body: this.generatePostmanBody(details)
                    }
                });
            }
        }

        return items;
    }

    generatePostmanHeaders(endpoint) {
        const headers = [
            {
                key: 'Content-Type',
                value: 'application/json'
            }
        ];

        if (endpoint.security) {
            headers.push({
                key: 'Authorization',
                value: 'Bearer {{accessToken}}'
            });
        }

        return headers;
    }

    generatePostmanBody(endpoint) {
        if (!endpoint.requestBody) return null;

        return {
            mode: 'raw',
            raw: JSON.stringify(
                this.generateExampleFromSchema(
                    endpoint.requestBody.content['application/json'].schema
                ),
                null,
                2
            ),
            options: {
                raw: {
                    language: 'json'
                }
            }
        };
    }

    generateExampleFromSchema(schema) {
        if (schema.example) return schema.example;
        if (schema.type === 'object') {
            const example = {};
            for (const [prop, details] of Object.entries(schema.properties)) {
                example[prop] = this.generateExampleFromSchema(details);
            }
            return example;
        }
        // Add more type handling as needed
        return null;
    }
}

module.exports = new MatchApiDocService(); 