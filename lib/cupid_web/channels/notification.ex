defmodule CupidWeb.Notification do
  alias Cupid.Users
  alias Cupid.Users.User
  alias CupidWeb.Endpoint

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

  def match(match_id, user1_id, user2_id) do
    user1 = Users.get_user!(user1_id)
    user2 = Users.get_user!(user2_id)

    Endpoint.broadcast!(
      "notification:" <> to_string(user1_id),
      "add_friend",
      %{id: match_id, user: friend(user2)}
    )

    Endpoint.broadcast!(
      "notification:" <> to_string(user2_id),
      "add_friend",
      %{id: match_id, user: friend(user1)}
    )
  end

  defp friend(%User{} = u) do
    %{
      id: u.id,
      email: u.email,
      name: u.name
    }
  end

  defp notify(user_id, msg, type, headline, content) do
    Endpoint.broadcast!("notification:" <> to_string(user_id), msg, %{
      type: type,
      headline: headline,
      message: content
    })
  end
end
