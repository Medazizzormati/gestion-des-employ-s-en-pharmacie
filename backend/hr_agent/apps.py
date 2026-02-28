from django.apps import AppConfig


class HrAgentConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'hr_agent'
    verbose_name = 'HR Agent'

    def ready(self):
        import hr_agent.signals  # noqa
