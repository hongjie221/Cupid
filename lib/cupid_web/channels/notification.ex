defmodule CupidWeb.Notification do

    def notify_info(user_id, msg, headline, content) do
        notify(user_id, msg, "info", headline, content)
    end

    def notify_success(user_id, msg, headline, content) do
        notify(user_id, msg, "success", headline, content)
    end

    def notify_warning(user_id, msg, headline, content) do
        notify(user_id, msg, "warning", headline, content)
    end

    def notify_danger(user_id, msg, headline, content) do
        notify(user_id, msg, "danger", headline, content)
    end

    defp notify(user_id, msg, type, headline, content) do

        CupidWeb.Endpoint.broadcast!("notification:" <> to_string(user_id), msg,
            %{type: type, headline: headline, message: content})
    end


end
