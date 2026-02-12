# Stage 1: Build
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy csproj files and restore dependencies
COPY ["FlowForge.API/FlowForge.API.csproj", "FlowForge.API/"]
COPY ["FlowForge.Application/FlowForge.Application.csproj", "FlowForge.Application/"]
COPY ["FlowForge.Domain/FlowForge.Domain.csproj", "FlowForge.Domain/"]
COPY ["FlowForge.Infrastructure/FlowForge.Infrastructure.csproj", "FlowForge.Infrastructure/"]

RUN dotnet restore "FlowForge.API/FlowForge.API.csproj"

# Copy the remaining files and build
COPY . .
WORKDIR "/src/FlowForge.API"
RUN dotnet build "FlowForge.API.csproj" -c Release -o /app/build

# Stage 2: Publish
FROM build AS publish
RUN dotnet publish "FlowForge.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Stage 3: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "FlowForge.API.dll"]
