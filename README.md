# 🤖 Autonomous GPT - A Typescript Implementation

### 🏔 Purpose
The purpose of this codebase is to build my foundational knowledge in out auto-gpt works, I wanted to build this project from scratch to truly comprehend the underlying ideas. Most of the concepts and ideas are the same (and a lot of the structure is heavily inspired by Auto-GPT); the main difference in the implementation between this implementation (at the time I start this project) and the original Auto-GPT codebase is that I took a more OOO approach to keep it maintainability and a bit of DDD inspiration for modularity.

### 🚀 Getting started

1. Install the package

```bash
npm install
```

2. Setup environment variables

- Copy paste the .env.example file 
- Rename it to .env
- Fill in the values

3. Start Docker

```bash
npm run docker-compose
```

4. Run the example

```bash
ts-node src/main.ts
```

### 📚 Further Information
I wrote a blog post about how I designed the system and my findings [here](https://darylrodrigo.notion.site/Building-a-Typescript-Version-of-Auto-GPT-Implementation-and-Findings-3a4d30fc6e8c48329ad03ab3f7a4aeed). The interesting take aways were:
- With the modularity in it's design it allowed GPT-4 to fully generate its own capabilities.
- Inbuilt command correction allowed for much better performance.
