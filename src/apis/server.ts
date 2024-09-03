import type { SessionData } from '@/interfaces/session-data'

export function loginApi(username: string, password: string): Promise<SessionData> {
  console.log(username, password)

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        token: 'token',
        user: {
          id: 1,
          username: 'admin'
        }
      })
    }, 1000)
  })
}

export function getK8sClusters() {
  return makeFakeRequest([
    {
      id: 1,
      name: '北京1区'
    },
    {
      id: 2,
      name: '北京2区'
    },
    {
      id: 3,
      name: '天津1区'
    },
    {
      id: 4,
      name: '上海1区'
    }
  ])
}

export function getDeployments(clusterId: number) {
  return makeFakeRequest({
    pageSize: 10,
    totalCount: 30,
    pageNo: 0,
    deployments: [
      {
        id: 1,
        clusterName: '订单',
        platform: '平面A',
        agentStatus: '启用',
        deployAgent: 'otel_agent1.7.jar',
        agentId: 1,
        autoResend: '是',
        agentType: 'jdk1.7',
        configVariables: [
          {
            name: 'otel.metrics.exporter',
            value: 'prometheus'
          },
          {
            name: 'otel.exporter.prometheus.port',
            value: '9469'
          }
        ],
        operationTime: new Date('2024-4-23 12:35:01')
      },
      {
        id: 2,
        clusterName: 'busi-ord-yyt-xxg',
        platform: '平面E',
        agentStatus: '禁用',
        deployAgent: 'otel_agent1.8.jar',
        autoResend: '是',
        agentType: 'jdk1.8',
        configVariables: [
          {
            name: 'otel.metrics.exporter',
            value: 'prometheus'
          },
          {
            name: 'otel.exporter.prometheus.port',
            value: '9469'
          }
        ],
        operationTime: new Date('2024-4-23 12:33:01')
      },
      {
        id: 3,
        clusterName: '产品',
        platform: '平面A',
        agentStatus: '未启用'
      }
    ]
  })
}

export function getAgentsList() {
  return makeFakeRequest([
    {
      id: 1,
      language: 'java',
      version: '1.7',
      description: '支持jdk 1.7及以上版本的应用'
    },
    {
      id: 2,
      language: 'java',
      version: '1.8',
      description: '支持jdk 1.8及以上版本的应用'
    },
    {
      id: 3,
      language: 'python',
      version: '3.x',
      description: '支持Python3.0及以上版本的应用'
    },
    {
      id: 4,
      language: 'go',
      version: '1.0',
      description: '支持go1.0及以上版本的应用'
    },
    {
      id: 5,
      language: '.net',
      version: '3.x',
      description: '支持.net3.0及以上版本的应用'
    },
    {
      id: 6,
      language: 'php',
      version: '1.0',
      description: '支持php语言编写的应用'
    },
    {
      id: 7,
      language: 'javascript',
      version: '1.0',
      description: '支持javascript语言编写的应用'
    }
  ])
}

export function ebpfAgentList() {
  return makeFakeRequest({
    pageSize: 10,
    totalCount: 30,
    pageNo: 0,
    agents: [
      {
        id: 1,
        name: 'ebpf_cn_db',
        cluster: '北京1区',
        platform: '平面A',
        group: '国产库',
        status: '运行',
        type: '物理机',
        os: 'Eular23.1',
        cpuLimit: 5,
        memoryLimit: 4096 * 1024,
        packetLimit: 0,
        agentGroup: '国产化库监控组',
        agentVersion: 'Trident-DaemonSet镜像1.0',
        operationTime: new Date('2024-4-23 12:35:01')
      },
      {
        id: 2,
        name: 'ebpf_cache',
        cluster: '北京2区',
        platform: '平面E',
        group: '缓存中间件',
        status: '停止',
        type: '容器POD',
        os: 'Eular23.1',
        cpuLimit: 5,
        memoryLimit: 4096 * 1024,
        packetLimit: 0,
        agentGroup: '国产化库监控组',
        agentVersion: 'Trident进程1.2',
        operationTime: new Date('2024-4-23 12:35:01')
      },
      {
        id: 3,
        name: 'ebpf_mq',
        cluster: '天津1区',
        platform: '平面A',
        group: '消息中间件',
        status: '运行',
        type: 'KVM',
        os: 'CentOS8.2',
        cpuLimit: 5,
        memoryLimit: 4096 * 1024,
        packetLimit: 0,
        agentGroup: '国产化库监控组',
        agentVersion: 'Trident-DaemonSet镜像1.0',
        operationTime: new Date('2024-4-23 12:35:01')
      },
      {
        id: 4,
        name: 'ebpf_crm_java7',
        cluster: '上海1区',
        platform: '平面E',
        group: 'CRM中心化',
        status: '运行',
        type: '容器POD',
        os: 'Eular23.1',
        cpuLimit: 5,
        memoryLimit: 4096 * 1024,
        packetLimit: 0,
        agentGroup: '国产化库监控组',
        agentVersion: 'Rosen进程1.0',
        operationTime: new Date('2024-4-23 12:35:01')
      }
    ]
  })
}

export function rumHttpHeaderList() {
  return makeFakeRequest({
    pageSize: 10,
    totalCount: 30,
    pageNo: 0,
    items: [
      {
        variable: 'BizCode',
        name: '业务编码'
      },
      {
        variable: 'TransID',
        name: '交易ID'
      }
    ]
  })
}

export function spanFieldsList() {
  return makeFakeRequest({
    pageSize: 10,
    totalCount: 30,
    pageNo: 0,
    items: [
      {
        extentionType: '环境变量',
        variableName: 'SRV_TYPE',
        spanFieldName: 'Service_Type',
        status: '生效'
      },
      {
        extentionType: '命令行参数',
        variableName: 'StartOption',
        spanFieldName: 'Start_Tag',
        status: '生效'
      },
      {
        extentionType: 'JVM参数',
        variableName: 'KICK_OFF',
        spanFieldName: 'Kick_Off',
        status: '生效'
      }
    ]
  })
}

export function spanTranslationList() {
  return makeFakeRequest({
    pageSize: 10,
    totalCount: 30,
    pageNo: 0,
    items: [
      {
        fieldType: '服务字段属性',
        spanFieldName: 'SpanName',
        spanFieldChinese: '服务名称',
        status: '生效'
      },
      {
        fieldType: '资源属性',
        spanFieldName: 'Service',
        spanFieldChinese: '应用名称',
        status: '失效'
      }
    ]
  })
}

export function spanCommonalitiesBlacklist() {
  return makeFakeRequest({
    pageSize: 10,
    totalCount: 30,
    pageNo: 0,
    items: [
      {
        fieldType: 'Span属性',
        spanFieldName: 'pid',
        status: '生效'
      },
      {
        fieldType: '资源属性',
        spanFieldName: 'threadid',
        status: '失效'
      }
    ]
  })
}

export function softwareTypeIdentificationRules() {
  return makeFakeRequest({
    pageSize: 10,
    totalCount: 30,
    pageNo: 0,
    items: [
      {
        softwareName: 'Redis',
        logo: 'https://www.iludou.com/wp-content/uploads/2020/09/1abb2dc3d76311944ffdbe9980fbaadd.jpg',
        rules: [
          {
            key: 'Span属性',
            value: '数据库系统=redis'
          },
          {
            key: '资源属性',
            value: 'otel库名称 contains lettuce'
          }
        ],
        status: '生效'
      },
      {
        softwareName: 'Oracle',
        logo: 'https://img2.baidu.com/it/u=3828785867,2464441740&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=317',
        rules: [
          {
            key: 'Span属性',
            value: '数据库系统=oracle'
          }
        ],
        status: '生效'
      },
      {
        softwareName: 'Nginx',
        logo: 'https://img2.baidu.com/it/u=3758125601,3743939720&fm=253&fmt=auto&app=138&f=JPEG?w=350&h=253',
        rules: [
          {
            key: 'Span属性',
            value: 'SpanType=nginx'
          }
        ],
        status: '生效'
      }
    ]
  })
}

export function customSpanFieldsList() {
  return makeFakeRequest({
    pageSize: 10,
    totalCount: 30,
    pageNo: 0,
    items: [
      {
        fieldType: '服务字段属性',
        originalField: 'SpanName',
        businessField: '接口编码',
        status: '生效'
      },
      {
        fieldType: '入参',
        originalField: 'SearialNumber',
        businessField: '手机号',
        status: '生效'
      },
      {
        fieldType: '出参',
        originalField: 'AccountFee',
        businessField: '账户余额',
        status: '生效'
      }
    ]
  })
}

export function k8sDeployments() {
  return makeFakeRequest({
    totalCount: 4,
    items: [
      {
        platformName: '平面A',
        platformCode: 'A',
        clusterName: '北京1区',
        address: 'https://10.243.3.24:6443',
        username: 'admin',
        serverCertificate:
          '-----BEGIN CERTIFICATE-----\nMIIDXTCCAkWgAwIBAgIJALa6F1N1MA0G...\n-----END CERTIFICATE-----',
        clientCertificate:
          '-----BEGIN CERTIFICATE-----\nMIIDXTCCAkWgAwIBAgIJALa6F1N1MA0G...\n-----END CERTIFICATE-----',
        clientKey:
          '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASC...\n-----END PRIVATE KEY-----'
      },
      {
        platformName: '平面E',
        platformCode: 'XXG',
        clusterName: '北京2区',
        address: 'https://12.253.2.34:6443',
        username: 'admin',
        serverCertificate:
          '-----BEGIN CERTIFICATE-----\nMIIDXTCCAkWgAwIBAgIJALa6F1N1MA0G...\n-----END CERTIFICATE-----',
        clientCertificate:
          '-----BEGIN CERTIFICATE-----\nMIIDXTCCAkWgAwIBAgIJALa6F1N1MA0G...\n-----END CERTIFICATE-----',
        clientKey:
          '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASC...\n-----END PRIVATE-----'
      },
      {
        platformName: '平面B',
        platformCode: 'LQ',
        clusterName: '天津1区',
        address: 'https://10.243.1.24:6443',
        username: 'admin',
        serverCertificate:
          '-----BEGIN CERTIFICATE-----\nMIIDXTCCAkWgAwIBAgIJALa6F1N1MA0G...\n-----END CERTIFICATE-----',
        clientCertificate:
          '-----BEGIN CERTIFICATE-----\nMIIDXTCCAkWgAwIBAgIJALa6F1N1MA0G...\n-----END CERTIFICATE-----',
        clientKey:
          '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASC...\n-----END PRIVATE-----'
      },
      {
        platformName: '平面D',
        platformCode: 'SC',
        clusterName: '上海1区',
        address: 'https://40.23.1.124:6443',
        username: 'admin',
        serverCertificate:
          '-----BEGIN CERTIFICATE-----\nMIIDXTCCAkWgAwIBAgIJALa6F1N1MA0G...\n-----END CERTIFICATE-----',
        clientCertificate:
          '-----BEGIN CERTIFICATE-----\nMIIDXTCCAkWgAwIBAgIJALa6F1N1MA0G...\n-----END CERTIFICATE-----',
        clientKey:
          '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASC...\n-----END PRIVATE-----'
      }
    ]
  })
}

export function ebpfAgentsGroups() {
  return makeFakeRequest({
    totalCount: 2,
    items: [
      {
        id: '9904afa47efe135c35cbc589552573c9',
        name: '国产化库监控组',
        agentCount: 0,
        networkPort: 'anpi1'
      },
      {
        id: 'e8e72845eec9fbfceac61058ef975d97',
        name: '消息中间件监控组',
        agentCount: 2,
        networkPort: 'llw0'
      }
    ]
  })
}

export function exceptionClassification() {
  return makeFakeRequest([
    {
      id: 1,
      name: 'app-exception',
      exceptions: [
        {
          name: 'ApplicationValidationException',
          fullName: 'com.stardata.starshop2.sharedcontext.exception.ApplicationValidationException',
          identifyRootOnly: false
        },
        {
          name: 'CannotAcquireLockException',
          fullName: 'org.springframework.dao.CannotAcquireLockException',
          identifyRootOnly: false
        },
        {
          name: 'DataIntegrityViolationException',
          fullName: 'org.springframework.dao.DataIntegrityViolationException',
          identifyRootOnly: false
        },
        {
          name: 'InternalServerError',
          fullName: 'feign.FeignException.InternalServerError',
          identifyRootOnly: false
        },
        {
          name: 'RetryableException',
          fullName: 'feign.RetryableException',
          identifyRootOnly: false
        }
      ]
    },
    {
      id: 2,
      name: 'database-exception',
      exceptions: [
        {
          name: 'CannotCreateTransactionException',
          fullName: 'org.springframework.transaction.CannotCreateTransactionException',
          identifyRootOnly: false
        },
        {
          name: 'MySQLTransactionRollbackException',
          fullName: 'com.mysql.cj.jdbc.exceptions.MySQLTransactionRollbackException',
          identifyRootOnly: false
        },
        {
          name: 'PSQLException',
          fullName: 'org.opengauss.util.PSQLException',
          identifyRootOnly: false
        },
        {
          name: 'QueryTimeoutException',
          fullName: 'javax.persistence.QueryTimeoutException',
          identifyRootOnly: false
        },
        {
          name: 'RollbackException',
          fullName: 'javax.persistence.RollbackException',
          identifyRootOnly: false
        }
      ]
    },
    {
      id: 3,
      name: 'kafka-exception',
      exceptions: [
        {
          name: 'TimeoutException',
          fullName: 'org.apache.kafka.common.errors.TimeoutException',
          identifyRootOnly: false
        }
      ]
    },
    {
      id: 4,
      name: 'network-exception',
      exceptions: [
        {
          name: 'AnnotatedConnectException',
          fullName: 'io.netty.channel.AbstractChannel.AnnotatedConnectException',
          identifyRootOnly: false
        },
        {
          name: 'ConnectTimeoutException',
          fullName: 'io.netty.channel.ConnectTimeoutException',
          identifyRootOnly: false
        },
        {
          name: 'PrematureCloseException',
          fullName: 'reactor.netty.http.client.PrematureCloseException',
          identifyRootOnly: false
        },
        {
          name: 'RpcException',
          fullName: 'org.apache.dubbo.rpc.RpcException',
          identifyRootOnly: false
        },
        {
          name: 'UnknownHostException',
          fullName: 'java.net.UnknownHostException',
          identifyRootOnly: false
        }
      ]
    },
    {
      id: 5,
      name: 'general-exception',
      exceptions: [
        {
          name: 'IllegalStateException',
          fullName: 'java.lang.IllegalStateException',
          identifyRootOnly: false
        },
        {
          name: 'PersistenceException',
          fullName: 'javax.persistence.PersistenceException',
          identifyRootOnly: false
        },
        {
          name: 'RuntimeException',
          fullName: 'java.lang.RuntimeException',
          identifyRootOnly: false
        }
      ]
    }
  ])
}

export function systemExceptionRules() {
  return makeFakeRequest([
    {
      rules: [
        {
          key: 'exception.definition.name',
          value: 'exists'
        },
        {
          key: 'exception.definition.name',
          value: '!= ApplicationValidationException'
        }
      ],
      status: '生效'
    }
  ])
}

export function appExceptionRules() {
  return makeFakeRequest([
    {
      rules: [
        {
          key: 'exception.definition.name',
          value: '= ApplicationValidationException'
        }
      ],
      status: '生效'
    }
  ])
}

export function kafkaExpoterServers() {
  return makeFakeRequest([
    {
      id: 1,
      exportTypes: ['日志', '链路', '指标'],
      ip: '10.23.214.56:9900,10.23.214.57:9900,10.23.214.58:9900',
      status: '生效',
      protocol: 'SASL_PLAINTEXT',
      encryption: 'PLAIN',
      username: 'admin',
      password: 'password'
    },
    {
      id: 2,
      exportTypes: ['日志', '链路'],
      ip: '10.23.214.56:9900,10.23.214.57:9900,10.23.214.58:9900',
      status: '生效',
      protocol: 'SASL_PLAINTEXT',
      encryption: 'PLAIN',
      username: 'admin',
      password: 'password'
    },
    {
      id: 3,
      exportTypes: ['指标'],
      ip: '10.23.214.56:9900,10.23.214.57:9900,10.23.214.58:9900',
      status: '生效',
      protocol: 'SASL_PLAINTEXT',
      encryption: 'PLAIN',
      username: 'admin',
      password: 'password'
    }
  ])
}

export function agentDownload() {
  return makeFakeRequest([
    {
      id: 1,
      language: 'Java',
      version: 'JDK1.7及以上',
      signals: '链路、指标、日志',
      agentFile: 'catpupil_agent_java7.jar'
    },
    {
      id: 2,
      language: 'Java',
      version: 'JDK1.8及以上',
      signals: '链路、指标、日志',
      agentFile: 'catpupil_agent_java8.jar'
    },
    {
      id: 3,
      language: 'JavaScript',
      version: '不限',
      signals: '链路、指标',
      agentFile: 'catpupil_agent_js.tgz'
    },
    {
      id: 4,
      language: 'Python',
      version: 'Python 2.x',
      signals: '链路、指标',
      agentFile: 'catpupil_agent_python2.tgz'
    },
    {
      id: 5,
      language: 'Python',
      version: 'Python 3.x',
      signals: '链路、指标',
      agentFile: 'catpupil_agent_python3.tgz'
    },
    {
      id: 3,
      language: 'PHP',
      version: 'PHP 8.0及以上',
      signals: '链路、指标、日志',
      agentFile: 'catpupil_agent_php8.phar'
    },
    {
      id: 4,
      language: 'PHP',
      version: 'PHP 8.0及以上',
      signals: '链路、指标、日志',
      agentFile: 'catpupil_agent_php8.tgz'
    },
    {
      id: 5,
      language: 'GO',
      version: 'GO1.18及以上',
      signals: '链路、指标、日志',
      agentFile: 'catpupil_agent_go.img'
    },
    {
      id: 6,
      language: 'C#/.NET',
      version: '.NET Framework 4.6.2及以上',
      signals: '链路、指标、日志',
      agentFile: 'catpupil_agent_net.img'
    }
  ])
}

export function sdkDownload() {
  return makeFakeRequest([
    {
      language: 'C++',
      versions: ['C++ 14及以上', 'CMake 3.25及以上'],
      features: ['链路', '指标', '日志'],
      downloadLink: 'catpupil_sdk_c.tgz'
    },
    {
      language: 'Erlang/Elixir',
      versions: ['Erlang 23及以上', 'Elixir 1.13及以上'],
      features: ['链路'],
      downloadLink: 'catpupil_sdk_erlang.tgz'
    },
    {
      language: 'Ruby',
      versions: ['不限'],
      features: ['链路'],
      downloadLink: 'catpupil_sdk_ruby.tgz'
    },
    {
      language: 'Rust',
      versions: ['不限'],
      features: ['链路', '指标', '日志'],
      downloadLink: 'catpupil_sdk_rust.tgz'
    },
    {
      language: 'Swift',
      versions: ['不限'],
      features: ['链路'],
      downloadLink: 'catpupil_swift_sdk.tgz'
    },
    {
      language: 'GO',
      versions: ['GO1.18及以上, 代码入侵， 适合Go和其它语言混合架构'],
      features: ['链路', '指标', '日志'],
      notes: '代码侵入，适合GO和其它语言混合架构',
      downloadLink: 'catpupil_sdk_go.tgz'
    }
  ])
}

export function bBPFAgentDownload() {
  return makeFakeRequest([
    {
      name: 'Linux',
      version: 'Ubuntu 20.04 LTS',
      signals: '链路、指标',
      downloadLink: 'catpupil ebpf ubuntu20.tgz'
    },
    {
      name: 'Linux',
      version: 'Ubuntu 22.04 LTS',
      signals: '链路、指标',
      downloadLink: 'catpupil_ebpf_ubuntu22.tgz'
    },
    {
      name: 'Linux',
      version: 'Debian 11 (Bullseye)',
      signals: '链路、指标',
      downloadLink: 'catpupil_ebpf_debian11.tgz'
    },
    {
      name: 'Linux',
      version: 'Debian 12 (Bookworm)',
      signals: '链路、指标',
      downloadLink: 'catpupil_ebpf_debian12.tgz'
    },
    {
      name: 'Linux',
      version: 'RHEL 8.6',
      signals: '链路、指标',
      downloadLink: 'catpupil_ebpf_rhel86.tgz'
    },
    {
      name: 'Linux',
      version: 'RHEL 9.1',
      signals: '链路、指标',
      downloadLink: 'catpupil_ebpf_rhel91.tgz'
    },
    {
      name: '龙蜥 (Anolis OS)',
      version: '22.xx',
      signals: '链路、指标',
      downloadLink: 'catpupil_ebpf_anolis22.tgz'
    },
    {
      name: '龙蜥 (Anolis OS)',
      version: '23.xx',
      signals: '链路、指标',
      downloadLink: 'catpupil_ebpf_anolis23.tgz'
    },
    {
      name: '欧拉 (openEuler)',
      version: '22.xx',
      signals: '链路、指标',
      downloadLink: 'catpupil_ebpf_euler22.tgz'
    },
    {
      name: '欧拉 (openEuler)',
      version: '23.xx',
      signals: '链路、指标',
      downloadLink: 'catpupil_ebpf_euler23.tgz'
    }
  ])
}

function makeFakeRequest<T>(data: T): Promise<T> {
  return new Promise<T>((resolve) => {
    setTimeout(() => {
      resolve(data)
    }, 100)
  })
}
