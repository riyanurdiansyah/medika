import React from 'react'// ** React Imports
import { ReactNode } from 'react'
import SwaggerUI from 'swagger-ui-react'
import 'swagger-ui-react/swagger-ui.css'
// ** Layout Import
import BlankLayout from 'src/@core/layouts/BlankLayout'

const SwaggerPage = () => {
  const swaggerOptions = {
    spec: {
      openapi: '3.0.0',
      info: {
        title: 'FCM Notification API',
        description: 'Firebase Cloud Messaging (FCM) API for sending push notifications',
        version: '1.0.0',
        contact: {
          name: 'API Support',
          email: 'support@example.com'
        }
      },
      servers: [
        {
          url: 'http://localhost:3000',
          description: 'Development server'
        }
      ],
      paths: {
        '/api/fcm/send/': {
          post: {
            summary: 'Send FCM Notification',
            description: 'Send a push notification to one or more devices using Firebase Cloud Messaging',
            tags: ['FCM'],
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    required: ['notification'],
                    properties: {
                      to: {
                        type: 'string',
                        description: 'FCM device token for single device notification',
                        example: 'fcm_device_token_here'
                      },
                      registrationIds: {
                        type: 'array',
                        items: {
                          type: 'string'
                        },
                        description: 'Array of FCM device tokens for multiple devices',
                        example: ['token1', 'token2', 'token3']
                      },
                      topic: {
                        type: 'string',
                        description: 'Topic name for topic-based notification',
                        example: 'news'
                      },
                      notification: {
                        type: 'object',
                        required: ['title', 'body'],
                        properties: {
                          title: {
                            type: 'string',
                            description: 'Notification title',
                            example: 'Hello!'
                          },
                          body: {
                            type: 'string',
                            description: 'Notification body',
                            example: 'This is a test notification'
                          },
                          icon: {
                            type: 'string',
                            description: 'URL of the notification icon',
                            example: 'https://example.com/icon.png'
                          },
                          clickAction: {
                            type: 'string',
                            description: 'Action to perform when notification is clicked',
                            example: 'OPEN_ACTIVITY'
                          }
                        }
                      },
                      data: {
                        type: 'object',
                        description: 'Additional data to send with the notification',
                        example: {
                          messageId: '123',
                          type: 'chat',
                          userId: 'user123'
                        }
                      },
                      priority: {
                        type: 'string',
                        enum: ['normal', 'high'],
                        description: 'Notification priority',
                        example: 'high'
                      },
                      collapseKey: {
                        type: 'string',
                        description: 'Collapse key for notification grouping',
                        example: 'chat_message'
                      },
                      timeToLive: {
                        type: 'integer',
                        description: 'Time to live in seconds',
                        example: 3600
                      },
                      delayWhileIdle: {
                        type: 'boolean',
                        description: 'Delay sending until device becomes active',
                        example: false
                      }
                    }
                  },
                  examples: {
                    'Single Device': {
                      summary: 'Send to single device',
                      value: {
                        to: 'fcm_device_token_here',
                        notification: {
                          title: 'Hello!',
                          body: 'This is a test notification'
                        },
                        data: {
                          messageId: '123',
                          type: 'chat'
                        },
                        priority: 'high'
                      }
                    },
                    'Multiple Devices': {
                      summary: 'Send to multiple devices',
                      value: {
                        registrationIds: ['token1', 'token2', 'token3'],
                        notification: {
                          title: 'Hello!',
                          body: 'This is a test notification'
                        }
                      }
                    },
                    'Topic Notification': {
                      summary: 'Send to topic subscribers',
                      value: {
                        topic: 'news',
                        notification: {
                          title: 'Breaking News!',
                          body: 'Important update for all subscribers'
                        }
                      }
                    }
                  }
                }
              }
            },
            responses: {
              '200': {
                description: 'Notification sent successfully',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        success: {
                          type: 'boolean',
                          example: true
                        },
                        messageId: {
                          type: 'string',
                          description: 'Firebase message ID',
                          example: 'projects/e-recruitment-59a9b/messages/123456789'
                        },
                        response: {
                          type: 'object',
                          description: 'Firebase response object'
                        }
                      }
                    },
                    example: {
                      success: true,
                      messageId: 'projects/e-recruitment-59a9b/messages/123456789',
                      response: {
                        name: 'projects/e-recruitment-59a9b/messages/123456789'
                      }
                    }
                  }
                }
              },
              '400': {
                description: 'Bad request - missing required fields',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        error: {
                          type: 'string',
                          example: 'Notification title and body are required'
                        }
                      }
                    }
                  }
                }
              },
              '405': {
                description: 'Method not allowed',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        error: {
                          type: 'string',
                          example: 'Method not allowed'
                        }
                      }
                    }
                  }
                }
              },
              '500': {
                description: 'Internal server error',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        error: {
                          type: 'string',
                          example: 'Invalid device token. Please provide a valid FCM device token.'
                        },
                        details: {
                          type: 'string',
                          example: 'The registration token is not a valid FCM registration token'
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        '/api/fcm/send-with-json/': {
          post: {
            summary: 'Send FCM Notification (JSON Credentials)',
            description: 'Alternative endpoint using service account JSON directly',
            tags: ['FCM'],
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/FCMRequest'
                  }
                }
              }
            },
            responses: {
              '200': {
                description: 'Notification sent successfully',
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/FCMResponse'
                    }
                  }
                }
              },
              '400': {
                description: 'Bad request',
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/ErrorResponse'
                    }
                  }
                }
              },
              '500': {
                description: 'Internal server error',
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/ErrorResponse'
                    }
                  }
                }
              }
            }
          }
        }
      },
      components: {
        schemas: {
          FCMRequest: {
            type: 'object',
            required: ['notification'],
            properties: {
              to: {
                type: 'string',
                description: 'FCM device token for single device'
              },
              registrationIds: {
                type: 'array',
                items: {
                  type: 'string'
                },
                description: 'Array of FCM device tokens'
              },
              topic: {
                type: 'string',
                description: 'Topic name for topic-based notification'
              },
              notification: {
                type: 'object',
                required: ['title', 'body'],
                properties: {
                  title: {
                    type: 'string',
                    description: 'Notification title'
                  },
                  body: {
                    type: 'string',
                    description: 'Notification body'
                  },
                  icon: {
                    type: 'string',
                    description: 'URL of the notification icon'
                  },
                  clickAction: {
                    type: 'string',
                    description: 'Action to perform when notification is clicked'
                  }
                }
              },
              data: {
                type: 'object',
                description: 'Additional data to send with the notification'
              },
              priority: {
                type: 'string',
                enum: ['normal', 'high'],
                description: 'Notification priority'
              },
              collapseKey: {
                type: 'string',
                description: 'Collapse key for notification grouping'
              },
              timeToLive: {
                type: 'integer',
                description: 'Time to live in seconds'
              },
              delayWhileIdle: {
                type: 'boolean',
                description: 'Delay sending until device becomes active'
              }
            }
          },
          FCMResponse: {
            type: 'object',
            properties: {
              success: {
                type: 'boolean',
                description: 'Whether the notification was sent successfully'
              },
              messageId: {
                type: 'string',
                description: 'Firebase message ID'
              },
              response: {
                type: 'object',
                description: 'Firebase response object'
              }
            }
          },
          ErrorResponse: {
            type: 'object',
            properties: {
              error: {
                type: 'string',
                description: 'Error message'
              },
              details: {
                type: 'string',
                description: 'Detailed error information'
              }
            }
          }
        }
      },
      tags: [
        {
          name: 'FCM',
          description: 'Firebase Cloud Messaging operations'
        }
      ]
    },
    docExpansion: 'list' as const,
    defaultModelsExpandDepth: 1,
    defaultModelExpandDepth: 1,
    tryItOutEnabled: true
  }

  return (
      <SwaggerUI {...swaggerOptions} />
  )
}


SwaggerPage.getLayout = (page: ReactNode) => <BlankLayout>{page}</BlankLayout>

export default SwaggerPage 