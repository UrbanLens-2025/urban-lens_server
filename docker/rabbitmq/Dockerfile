FROM rabbitmq:3.13-management

COPY ./delayed-plugin.ez /plugins/

RUN rabbitmq-plugins enable --offline rabbitmq_delayed_message_exchange