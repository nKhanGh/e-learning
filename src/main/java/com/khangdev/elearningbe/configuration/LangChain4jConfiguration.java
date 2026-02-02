package com.khangdev.elearningbe.configuration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class LangChain4jConfiguration {

    private String openApiKey;

    private String pineconeApiKey;

    private String pineConEnvironment;

    private String pineConeIndex;
}
