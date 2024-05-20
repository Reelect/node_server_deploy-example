# Initialises Terraform providers and sets their version numbers.
# details changed following the terraform version

terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "=3.64.0"
    }
    tls = {
        source = "hashicorp/tls"
        version = "4.0.5"
    }
  }
}

provider "azurerm" {
    features {}
}

provider "tls" {
}