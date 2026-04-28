# Use the official Jenkins LTS image as a base
FROM jenkins/jenkins:lts

# Switch to root user to install system packages
USER root

# Install essential build tools and dependencies
RUN apt-get update && apt-get install -y \
    curl \
    unzip \
    wget \
    git \
    python3 \
    python3-pip \
    apt-transport-https \
    ca-certificates \
    gnupg \
    lsb-release

# 1. Install Docker CLI (to build images from inside Jenkins)
RUN curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg && \
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/debian $(lsb_release -cs) stable" > /etc/apt/sources.list.d/docker.list && \
    apt-get update && apt-get install -y docker-ce-cli

# 2. Install Terraform
RUN wget -O- https://apt.releases.hashicorp.com/gpg | gpg --dearmor -o /usr/share/keyrings/hashicorp-archive-keyring.gpg && \
    echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com $(lsb_release -cs) main" > /etc/apt/sources.list.d/hashicorp.list && \
    apt-get update && apt-get install -y terraform

# 3. Install Node.js (for Frontend SCA and Build)
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs

# 4. Install Trivy (Container Security)
RUN wget -qO - https://aquasecurity.github.io/trivy-repo/deb/public.key | gpg --dearmor -o /usr/share/keyrings/trivy.gpg && \
    echo "deb [signed-by=/usr/share/keyrings/trivy.gpg] https://aquasecurity.github.io/trivy-repo/deb $(lsb_release -cs) main" > /etc/apt/sources.list.d/trivy.list && \
    apt-get update && apt-get install -y trivy

# 5. Install Checkov (IaC Security)
RUN pip3 install --no-cache-dir checkov --break-system-packages

# 6. Install Maven (for Backend Build and SCA)
RUN apt-get install -y maven

# Switch back to the jenkins user
USER jenkins
