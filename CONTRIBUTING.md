# Contributing to ShopSense

Thank you for considering contributing to ShopSense!

## Development Setup

### Prerequisites
- .NET 10 SDK
- Node.js 20+ and npm
- Python 3.11+
- Docker Desktop
- Git

### Getting Started
1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/ShopSense-Ecommerce.git`
3. Copy environment file: `cp .env.example .env`
4. Start infrastructure: `docker-compose up -d sqlserver redis rabbitmq`
5. Run locally: `start-local.bat` (Windows)

### Running Tests
```bash
# .NET tests (81 tests)
dotnet test src/backend --verbosity normal

# Python ML tests (62 tests)
cd src/ml/FraudService && python -m pytest tests/ -v
cd src/ml/RecommendationService && python -m pytest tests/ -v
cd src/ml/SentimentService && python -m pytest tests/ -v
cd src/ml/ForecastingService && python -m pytest tests/ -v
cd src/ml/ChurnService && python -m pytest tests/ -v
cd src/ml/PricingService && python -m pytest tests/ -v
```

### Training ML Models
Each ML service has its own training script. Download the
datasets from Kaggle (links in README.md) and run:
```bash
cd src/ml/{ServiceName}
python app/train.py
```

## Branch Strategy
- `main` — production-ready code
- Feature branches — `feature/your-feature-name`
- Bug fixes — `fix/bug-description`

## Pull Request Process
1. Create a feature branch from `main`
2. Write tests for new features
3. Ensure CI pipeline passes (all 5 jobs green)
4. Update README.md if adding new features
5. Submit PR with clear description

## Code Style
- .NET: Follow Microsoft C# conventions
- Angular: Follow Angular style guide
- Python: PEP 8 with type hints

## Architecture Decisions
- Clean Architecture for all .NET services
- Domain entities are persistence-ignorant
- ML services use FastAPI with Pydantic schemas
- All services communicate via Ocelot API Gateway
- RabbitMQ for async event-driven communication
