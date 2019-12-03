defmodule CupidWeb.RoomChannel do
    use CupidWeb, :channel

    alias Cupid.BackupAgent
    alias CupidWeb.Notification

    intercept [
		"new_msg"
	]

    def join("room:" <> room_id, _payload, socket) do
        room_id = room_id |> Integer.parse |> elem(0)
        if authorized?(room_id, socket) do
            mbox = BackupAgent.get(room_id) || []
            socket = socket |> assign(:room_id, room_id)
            BackupAgent.put(room_id, mbox)
			{:ok, %{mbox: mbox}, socket}
		else
			{:error, %{reason: "unauthorized"}}
		end
    end

    def handle_in("new_msg", %{"text" => text, "from" => from}, socket) do 
        IO.inspect(from)
        room_id = socket.assigns[:room_id]
        mbox = BackupAgent.get(room_id)
        name = socket.assigns.current_user.name
        mbox = mbox ++ [%{name: name, msg: text}]
        BackupAgent.put(room_id, mbox)
        broadcast!(socket, "new_msg", %{"mbox" => mbox, "from" => from})
        {:noreply, socket}
    end

    def handle_out("new_msg", %{"mbox" => mbox, "from" => from}, socket) do
        user = socket.assigns[:current_user]
        if user.id != from["id"] do
            Notification.notify_info(user.id, "new_match", "New Message", from["name"] <> " just sent you a message.")
        end
        push(socket, "new_msg", %{"mbox" => mbox})
        {:noreply, socket}
    end

    defp authorized?(id, socket) do
        Cupid.Matches.has_user(id, socket.assigns.current_user.id)
    end

end
